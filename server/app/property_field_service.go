package app

import (
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

type propertyFieldService struct {
	store PropertyFieldStore
	api   *pluginapi.Client
}

func NewPropertyFieldService(store PropertyFieldStore, api *pluginapi.Client) PropertyFieldService {
	return &propertyFieldService{
		store: store,
		api:   api,
	}
}

func (ps *propertyFieldService) Get(id string) (PropertyField, error) {
	return ps.store.Get(id)
}

func (ps *propertyFieldService) Create(propertyField PropertyField) (string, error) {
	//TODO: validate types

	return ps.store.Create(propertyField)
}

func (ps *propertyFieldService) GetFields(filter PropertyFieldFilterOptions) ([]PropertyField, error) {
	return ps.store.GetFields(filter)
}

func (ps *propertyFieldService) Update(propertyField PropertyField) error {
	return ps.store.Update(propertyField)
}

func (ps *propertyFieldService) Delete(id string) error {
	return ps.store.Delete(id)
}
