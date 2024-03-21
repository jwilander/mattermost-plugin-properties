package app

import (
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

type viewService struct {
	store       ViewStore
	memberStore ViewMemberStore
	api         *pluginapi.Client
}

func NewViewService(store ViewStore, memberStore ViewMemberStore, api *pluginapi.Client) ViewService {
	return &viewService{
		store:       store,
		memberStore: memberStore,
		api:         api,
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

	if view.Query.ChannelID != "" && len(view.Query.Excludes) == 0 && len(view.Query.Includes) == 0 {
		postList, err := vs.api.Post.GetPostsForChannel(view.Query.ChannelID, page, perPage)
		if err != nil {
			return Objects{}, errors.Wrap(err, "could not query objects")
		}

		//TODO: handle case where there's many system message in a row, potentially resulting in 0 posts being returned
		posts := postList.ToSlice()
		filteredPosts := []*model.Post{}
		for _, post := range posts {
			if !post.IsSystemMessage() {
				filteredPosts = append(filteredPosts, post)
			}
		}
		return Objects{Posts: filteredPosts}, nil
	}

	ids, err := vs.store.QueryObjects(view.Query, page, perPage)
	if err != nil {
		return Objects{}, errors.Wrap(err, "could not query objects")
	}

	posts, err := vs.api.Post.GetPostsById(ids)
	if err != nil {
		//TODO: handle not found better
		return Objects{}, errors.Wrap(err, "could not get posts")
	}

	return Objects{Posts: posts}, nil
}

func (vs *viewService) AddUserToView(userID string, viewID string) error {
	return vs.memberStore.Create(ViewMember{UserID: userID, ViewID: viewID})
}

func (vs *viewService) GetForUser(userID string) ([]View, error) {
	return vs.store.GetForUser(userID)
}
