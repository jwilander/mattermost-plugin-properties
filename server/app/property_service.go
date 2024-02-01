package app

import (
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"
)

type propertyService struct {
	store                PropertyStore
	propertyFieldService PropertyFieldService
	api                  *pluginapi.Client
}

func NewPropertyService(store PropertyStore, propertyFieldService PropertyFieldService, api *pluginapi.Client) PropertyService {
	return &propertyService{
		store:                store,
		propertyFieldService: propertyFieldService,
		api:                  api,
	}
}

func (ps *propertyService) Create(property Property) (string, error) {
	if property.ObjectID == "" {
		return "", errors.New("ObjectID should not be blank")
	}

	if property.PropertyFieldID == "" {
		return "", errors.New("PropertyFieldID should not be blank")
	}

	if property.Value == nil {
		property.Value = []interface{}{}
	}

	// Confirm field exists for property
	_, err := ps.propertyFieldService.Get(property.PropertyFieldID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return "", errors.Errorf("Tried to create property with unknown property_field with id: '%s'", property.PropertyFieldID)
		}
		return "", err
	}

	//TODO: validate value for selected field

	id, err := ps.store.Create(property)
	if err != nil {
		return "", err
	}

	return id, nil
}

func (ps *propertyService) GetForObject(objectID string) ([]Property, error) {
	return ps.store.GetByObjectID(objectID)
}
