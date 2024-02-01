package sqlstore

import (
	"database/sql"
	"encoding/json"

	"github.com/jwilander/mattermost-plugin-properties/server/app"

	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

type sqlProperty struct {
	app.Property
	ValueJSON json.RawMessage `db:"value"`
}

type propertyStore struct {
	pluginAPI      PluginAPIClient
	store          *SQLStore
	queryBuilder   sq.StatementBuilderType
	propertySelect sq.SelectBuilder
}

// Ensure propertyStore implements app.PropertyStore interface
var _ app.PropertyStore = (*propertyStore)(nil)

func NewPropertyStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.PropertyStore {
	propertySelect := sqlStore.builder.
		Select(
			"p.ID",
			"p.ObjectID",
			"p.PropertyFieldID",
			"p.Value",
			"pf.Name as PropertyFieldName",
		).
		From("PROP_Property p").
		LeftJoin("PROP_PropertyField pf ON p.PropertyFieldID = pf.ID")

	return &propertyStore{
		pluginAPI:      pluginAPI,
		store:          sqlStore,
		queryBuilder:   sqlStore.builder,
		propertySelect: propertySelect,
	}
}

func (p *propertyStore) Create(property app.Property) (id string, err error) {
	if property.ID != "" {
		return "", errors.New("ID should be empty")
	}
	property.ID = model.NewId()

	rawProperty, err := toSQLProperty(property)
	if err != nil {
		return "", err
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return "", errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	_, err = p.store.execBuilder(tx, sq.
		Insert("PROP_Property").
		SetMap(map[string]interface{}{
			"ID":              rawProperty.ID,
			"ObjectID":        rawProperty.ObjectID,
			"PropertyFieldID": rawProperty.PropertyFieldID,
			"Value":           rawProperty.ValueJSON,
		}))
	if err != nil {
		return "", errors.Wrap(err, "failed to store new property")
	}

	if err = tx.Commit(); err != nil {
		return "", errors.Wrap(err, "could not commit transaction")
	}

	return rawProperty.ID, nil
}

func (p *propertyStore) GetByObjectID(objectID string) ([]app.Property, error) {
	if objectID == "" {
		return []app.Property{}, errors.New("objectID cannot be blank")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return []app.Property{}, errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	var rawProperties []sqlProperty
	err = p.store.selectBuilder(tx, &rawProperties, p.propertySelect.Where(sq.Eq{"p.ObjectID": objectID}))
	if err == sql.ErrNoRows {
		return []app.Property{}, errors.Wrapf(app.ErrNotFound, "no properties exist for object_id '%s'", objectID)
	} else if err != nil {
		return []app.Property{}, errors.Wrapf(err, "failed to get property by object_id '%s'", objectID)
	}

	properties := make([]app.Property, len(rawProperties))
	for i, rp := range rawProperties {
		properties[i], err = toProperty(rp)
		if err != nil {
			return []app.Property{}, err
		}
	}

	return properties, nil
}

func toSQLProperty(property app.Property) (*sqlProperty, error) {
	valueJSON, err := json.Marshal(property.Value)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal value json for property id: '%s'", property.ID)
	}

	if len(valueJSON) > maxJSONLength {
		return nil, errors.Errorf("value json for property id '%s' is too long (max %d)", property.ID, maxJSONLength)
	}

	return &sqlProperty{
		Property:  property,
		ValueJSON: valueJSON,
	}, nil
}

func toProperty(rawProperty sqlProperty) (app.Property, error) {
	p := rawProperty.Property
	if len(rawProperty.ValueJSON) > 0 {
		if err := json.Unmarshal(rawProperty.ValueJSON, &p.Value); err != nil {
			return app.Property{}, errors.Wrapf(err, "failed to unmarshal value json for property id: '%s'", rawProperty.ID)
		}
	}

	return p, nil
}
