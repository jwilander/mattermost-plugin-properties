package sqlstore

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jwilander/mattermost-plugin-properties/server/app"

	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

type sqlPropertyField struct {
	app.PropertyField
	ValuesJSON json.RawMessage `db:"values"`
}

type propertyFieldStore struct {
	pluginAPI           PluginAPIClient
	store               *SQLStore
	queryBuilder        sq.StatementBuilderType
	propertyFieldSelect sq.SelectBuilder
}

// Ensure propertyFieldStore implements app.PropertyFieldStore interface
var _ app.PropertyFieldStore = (*propertyFieldStore)(nil)

func NewPropertyFieldStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.PropertyFieldStore {
	propertyFieldSelect := sqlStore.builder.
		Select(
			"p.ID",
			"p.TeamID",
			"p.UpdateAt",
			"p.Name",
			"p.Type",
			"p.Values",
		).
		From("PROP_PropertyField p")

	return &propertyFieldStore{
		pluginAPI:           pluginAPI,
		store:               sqlStore,
		queryBuilder:        sqlStore.builder,
		propertyFieldSelect: propertyFieldSelect,
	}
}

func (p *propertyFieldStore) Create(propertyField app.PropertyField) (id string, err error) {
	if propertyField.ID != "" {
		return "", errors.New("ID should be empty")
	}
	propertyField.ID = model.NewId()
	propertyField.UpdateAt = model.GetMillis()

	rawPropertyField, err := toSQLPropertyField(propertyField)
	if err != nil {
		return "", err
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return "", errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	_, err = p.store.execBuilder(tx, sq.
		Insert("PROP_PropertyField").
		SetMap(map[string]interface{}{
			"ID":       rawPropertyField.ID,
			"TeamID":   rawPropertyField.TeamID,
			"UpdateAt": rawPropertyField.UpdateAt,
			"UpdateBy": rawPropertyField.UpdateBy,
			"Name":     rawPropertyField.Name,
			"Type":     rawPropertyField.Type,
			"Values":   rawPropertyField.ValuesJSON,
		}))
	if err != nil {
		return "", errors.Wrap(err, "failed to store new propertyField")
	}

	if err = tx.Commit(); err != nil {
		return "", errors.Wrap(err, "could not commit transaction")
	}

	return rawPropertyField.ID, nil
}

func (p *propertyFieldStore) Get(id string) (app.PropertyField, error) {
	if id == "" {
		return app.PropertyField{}, errors.New("id cannot be blank")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return app.PropertyField{}, errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	var rawPropertyField sqlPropertyField
	err = p.store.getBuilder(tx, &rawPropertyField, p.propertyFieldSelect.Where(sq.Eq{"p.ID": id}))
	if err == sql.ErrNoRows {
		return app.PropertyField{}, errors.Wrapf(app.ErrNotFound, "no property_field exists for id '%s'", id)
	} else if err != nil {
		return app.PropertyField{}, errors.Wrapf(err, "failed to get property_field by id '%s'", id)
	}

	propertyField, err := toPropertyField(rawPropertyField)
	if err != nil {
		return app.PropertyField{}, err
	}

	return propertyField, nil
}

func (p *propertyFieldStore) GetFields(filter app.PropertyFieldFilterOptions) ([]app.PropertyField, error) {
	queryForResults := p.store.builder.
		Select(
			"p.ID",
			"p.TeamID",
			"p.UpdateAt",
			"p.UpdateBy",
			"p.Name",
			"p.Type",
			"p.Values",
		).
		From("PROP_PropertyField AS p")

	if filter.SearchTerm != "" {
		column := "p.Name"
		searchString := filter.SearchTerm

		// Postgres performs a case-sensitive search, so we need to lowercase
		// both the column contents and the search string
		if p.store.db.DriverName() == model.DatabaseDriverPostgres {
			column = "LOWER(p.Name)"
			searchString = strings.ToLower(filter.SearchTerm)
		}

		queryForResults = queryForResults.Where(sq.Like{column: fmt.Sprint("%", searchString, "%")})
	}

	if filter.TeamID != "" {
		if filter.ExcludeHigherLevelFields {
			queryForResults = queryForResults.Where(sq.Eq{"TeamID": filter.TeamID})
		} else {
			queryForResults = queryForResults.Where(sq.Or{sq.Eq{"TeamID": filter.TeamID}, sq.Eq{"TeamID": ""}})
		}
	}

	page := filter.Page
	perPage := filter.PerPage
	if page < 0 {
		page = 0
	}
	if perPage < 0 {
		perPage = 0
	}

	queryForResults = queryForResults.
		Offset(uint64(page * perPage)).
		Limit(uint64(perPage))

	var rawFields []sqlPropertyField
	err := p.store.selectBuilder(p.store.db, &rawFields, queryForResults)
	if err != nil && err != sql.ErrNoRows {
		return []app.PropertyField{}, errors.Wrap(err, "failed to get property fields")
	}

	fields := make([]app.PropertyField, len(rawFields))
	for index, f := range rawFields {
		fields[index], err = toPropertyField(f)
		if err != nil {
			return nil, errors.Wrapf(err, "can't convert raw property field to property field type")
		}
	}

	return fields, nil
}

func (p *propertyFieldStore) Update(propertyField app.PropertyField) error {
	tx, err := p.store.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	propertyField.UpdateAt = model.GetMillis()

	rawPropertyField, err := toSQLPropertyField(propertyField)
	if err != nil {
		return err
	}

	_, err = p.store.execBuilder(tx, sq.
		Update("PROP_PropertyField").
		SetMap(map[string]interface{}{
			"UpdateAt": rawPropertyField.UpdateAt,
			"UpdateBy": rawPropertyField.UpdateBy,
			"Name":     rawPropertyField.Name,
			"Values":   rawPropertyField.ValuesJSON,
		}).
		Where(sq.Eq{"ID": rawPropertyField.ID}))

	if err != nil {
		return errors.Wrapf(err, "failed to update property field with id '%s'", rawPropertyField.ID)
	}

	if err = tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}

func (p *propertyFieldStore) Delete(id string) error {
	if id == "" {
		return errors.New("id cannot be blank")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	_, err = p.store.execBuilder(tx, sq.
		Delete("PROP_PropertyField").
		Where(sq.Eq{"ID": id}))

	if err != nil {
		return errors.Wrapf(err, "failed to delete property field with id '%s'", id)
	}

	if err = tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return err
}

func toSQLPropertyField(propertyField app.PropertyField) (*sqlPropertyField, error) {
	valuesJSON, err := json.Marshal(propertyField.Values)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal values json for property_field id: '%s'", propertyField.ID)
	}

	if len(valuesJSON) > maxJSONLength {
		return nil, errors.Errorf("values json for property_field id '%s' is too long (max %d)", propertyField.ID, maxJSONLength)
	}

	return &sqlPropertyField{
		PropertyField: propertyField,
		ValuesJSON:    valuesJSON,
	}, nil
}

func toPropertyField(rawPropertyField sqlPropertyField) (app.PropertyField, error) {
	p := rawPropertyField.PropertyField
	if len(rawPropertyField.ValuesJSON) > 0 {
		if err := json.Unmarshal(rawPropertyField.ValuesJSON, &p.Values); err != nil {
			return app.PropertyField{}, errors.Wrapf(err, "failed to unmarshal value json for property_field id: '%s'", rawPropertyField.ID)
		}
	}

	return p, nil
}
