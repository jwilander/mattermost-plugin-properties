package app

import (
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"
)

type viewService struct {
	store ViewStore
	api   *pluginapi.Client
}

func NewViewService(store ViewStore, api *pluginapi.Client) ViewService {
	return &viewService{
		store: store,
		api:   api,
	}
}

func (vs *viewService) Create(view View) (string, error) {
	if view.Title == "" {
		return "", errors.New("Title should not be blank")
	}

	if len(view.Query.Fields) == 0 {
		return "", errors.New("Query fields should not be blank")
	}

	id, err := vs.store.Create(view)
	if err != nil {
		return "", err
	}

	return id, nil
}
