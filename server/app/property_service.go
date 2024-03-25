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

	// Confirm field exists
	_, err := ps.propertyFieldService.Get(property.PropertyFieldID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return "", errors.Errorf("tried to create property with unknown property_field with id=%s", property.PropertyFieldID)
		}
		return "", err
	}

	// Confirm post exists and pull channel/team ids
	if property.ObjectType == PropertyObjectTypePost {
		post, err := ps.api.Post.GetPost(property.ObjectID)
		if err != nil {
			return "", errors.Wrapf(err, "tried to create property with non-existent post with id=%s", property.ObjectID)
		}
		channel, err := ps.api.Channel.Get(post.ChannelId)
		if err != nil {
			return "", err
		}
		property.ChannelID = channel.Id
		property.TeamID = channel.TeamId
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

func (ps *propertyService) UpdateValue(id string, value []interface{}) error {
	return ps.store.UpdateValue(id, value)
}

func (ps *propertyService) Delete(id string) error {
	return ps.store.Delete(id)
}
