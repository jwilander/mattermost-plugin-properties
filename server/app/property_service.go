package app

import (
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

type propertyService struct {
	store PropertyStore
	api   *pluginapi.Client
}

func NewPropertyService(store PropertyStore, api *pluginapi.Client) PropertyService {
	return &propertyService{
		store: store,
		api:   api,
	}
}
