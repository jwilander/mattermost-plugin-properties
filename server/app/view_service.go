package app

import (
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

type viewService struct {
	store           ViewStore
	memberStore     ViewMemberStore
	propertyService PropertyService
	api             *pluginapi.Client
}

func NewViewService(store ViewStore, memberStore ViewMemberStore, propertyService PropertyService, api *pluginapi.Client) ViewService {
	return &viewService{
		store:           store,
		memberStore:     memberStore,
		propertyService: propertyService,
		api:             api,
	}
}

func (vs *viewService) Create(view View) (string, error) {
	if view.Title == "" {
		return "", errors.New("Title should not be blank")
	}

	if view.Type != ViewTypeList && view.Type != ViewTypeKanban {
		return "", errors.New("Type must be 'list' or 'kanban")
	}

	if len(view.Query.Excludes) == 0 && len(view.Query.Includes) == 0 && view.Query.ChannelID == "" {
		return "", errors.New("Query must have Includes, Excludes or ChannelID set")
	}

	id, err := vs.store.Create(view)
	if err != nil {
		return "", err
	}

	return id, nil
}

func (vs *viewService) GetObjectsForView(id string, page int, perPage int) (Objects, error) {
	view, err := vs.store.Get(id)
	if err != nil {
		return Objects{}, errors.Wrap(err, "could not get view")
	}

	var posts []*model.Post

	if view.Query.ChannelID != "" && len(view.Query.Excludes) == 0 && len(view.Query.Includes) == 0 {
		postList, err := vs.api.Post.GetPostsForChannel(view.Query.ChannelID, page, perPage)
		if err != nil {
			return Objects{}, errors.Wrapf(err, "could not query objects for channel_id=%s", view.Query.ChannelID)
		}

		//TODO: handle case where there's many system message in a row, potentially resulting in 0 posts being returned
		allPosts := postList.ToSlice()
		posts = []*model.Post{}
		for _, post := range allPosts {
			if !post.IsSystemMessage() {
				posts = append(posts, post)
			}
		}
	} else {
		ids, err := vs.store.QueryObjects(view.Query, page, perPage)
		if err != nil {
			return Objects{}, errors.Wrap(err, "could not query objects")
		}

		posts, err = vs.api.Post.GetPostsById(ids)
		if err != nil {
			//TODO: handle not found better
			return Objects{}, errors.Wrap(err, "could not get posts")
		}
	}

	objects := Objects{Posts: posts, Properties: map[string]PropertiesList{}}

	//TODO: batch these
	for _, post := range posts {
		properties, err := vs.propertyService.GetForObject(post.Id)
		if err != nil && !errors.Is(err, ErrNotFound) {
			return Objects{}, errors.Wrap(err, "could not get properties for object")
		}
		objects.Properties[post.Id] = properties
	}

	return objects, nil
}

func (vs *viewService) AddUserToView(userID string, viewID string) error {
	return vs.memberStore.Create(ViewMember{UserID: userID, ViewID: viewID})
}

func (vs *viewService) GetForUser(userID string) ([]View, error) {
	return vs.store.GetForUser(userID)
}
