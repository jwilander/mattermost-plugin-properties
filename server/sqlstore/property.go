package sqlstore

import (
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/jwilander/mattermost-plugin-properties/server/app"
)

type sqlProperty struct {
	app.Property
}

type propertyStore struct {
	pluginAPI    PluginAPIClient
	store        *SQLStore
	queryBuilder sq.StatementBuilderType
}

// Ensure propertyStore implements app.PropertyStore interface
var _ app.PropertyStore = (*propertyStore)(nil)

func NewPropertyStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.PropertyStore {
	return &propertyStore{
		pluginAPI:    pluginAPI,
		store:        sqlStore,
		queryBuilder: sqlStore.builder,
	}
}

func (p *propertyStore) Create(property app.Property) (id string, err error) {
	if property.ID != "" {
		return "", errors.New("ID should be empty")
	}

	return "", nil
}

func (p *propertyStore) GetByObjectID(objectID string) ([]app.Property, error) {
	return nil, nil
}
