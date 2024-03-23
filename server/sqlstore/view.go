package sqlstore

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/jwilander/mattermost-plugin-properties/server/app"

	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

type sqlView struct {
	app.View
	QueryJSON  json.RawMessage `db:"query"`
	FormatJSON json.RawMessage `db:"format"`
}

type viewStore struct {
	pluginAPI    PluginAPIClient
	store        *SQLStore
	queryBuilder sq.StatementBuilderType
	viewSelect   sq.SelectBuilder
}

// Ensure viewStore implements app.ViewStore interface
var _ app.ViewStore = (*viewStore)(nil)

func NewViewStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.ViewStore {
	viewSelect := sqlStore.builder.
		Select(
			"v.ID",
			"v.Title",
			"v.Type",
			"v.CreateAt",
			"v.Query",
			"v.Format",
		).
		From("PROP_View v")

	return &viewStore{
		pluginAPI:    pluginAPI,
		store:        sqlStore,
		queryBuilder: sqlStore.builder,
		viewSelect:   viewSelect,
	}
}

func (p *viewStore) Create(view app.View) (id string, err error) {
	if view.ID != "" {
		return "", errors.New("ID should be empty")
	}
	view.ID = model.NewId()
	view.CreateAt = model.GetMillis()

	rawView, err := toSQLView(view)
	if err != nil {
		return "", err
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return "", errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	_, err = p.store.execBuilder(tx, sq.
		Insert("PROP_View").
		SetMap(map[string]interface{}{
			"ID":       rawView.ID,
			"Title":    rawView.Title,
			"Type":     rawView.Type,
			"CreateAt": rawView.CreateAt,
			"Query":    rawView.QueryJSON,
			"Format":   rawView.FormatJSON,
		}))
	if err != nil {
		return "", errors.Wrap(err, "failed to store new view")
	}

	if err = tx.Commit(); err != nil {
		return "", errors.Wrap(err, "could not commit transaction")
	}

	return rawView.ID, nil
}

func (p *viewStore) Get(id string) (app.View, error) {
	if id == "" {
		return app.View{}, errors.New("id cannot be blank")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return app.View{}, errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	var rawView sqlView
	err = p.store.getBuilder(tx, &rawView, p.viewSelect.Where(sq.Eq{"v.ID": id}))
	if err == sql.ErrNoRows {
		return app.View{}, errors.Wrapf(app.ErrNotFound, "no view exists for id '%s'", id)
	} else if err != nil {
		return app.View{}, errors.Wrapf(err, "failed to get view by id '%s'", id)
	}

	if err = tx.Commit(); err != nil {
		return app.View{}, errors.Wrap(err, "could not commit transaction")
	}

	view, err := toView(rawView)
	if err != nil {
		return app.View{}, err
	}

	return view, nil
}

func (p *viewStore) GetForUser(userID string) ([]app.View, error) {
	if userID == "" {
		return []app.View{}, errors.New("user id cannot be blank")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return []app.View{}, errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	permissionsAndFilter := sq.Expr(`(
		EXISTS(SELECT 1
				FROM PROP_ViewMember as vm
				WHERE vm.ViewID = v.ID
				AND vm.UserID = ?)
		OR NOT EXISTS(SELECT 1
				FROM PROP_ViewMember as vm
				WHERE vm.ViewID = v.ID)
	)`, userID)

	var rawViews []sqlView
	err = p.store.selectBuilder(tx, &rawViews, p.viewSelect.Where(permissionsAndFilter))
	if err == sql.ErrNoRows {
		return []app.View{}, errors.Wrapf(app.ErrNotFound, "no views exist for user id '%s'", userID)
	} else if err != nil {
		return []app.View{}, errors.Wrapf(err, "failed to get view by id '%s'", userID)
	}

	if err = tx.Commit(); err != nil {
		return []app.View{}, errors.Wrap(err, "could not commit transaction")
	}

	views := make([]app.View, len(rawViews))
	for i, rawView := range rawViews {
		views[i], err = toView(rawView)
		if err != nil {
			return []app.View{}, err
		}
	}

	return views, nil
}

func (p *viewStore) Update(id string, title *string, query *app.Query, format *app.Format) error {
	if id == "" {
		return errors.New("ID must be set")
	}

	if title == nil && query == nil && format == nil {
		return errors.New("At least one of title, query or format must be set")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	tempView := app.View{Format: app.Format{}, Query: app.Query{}}

	if query != nil {
		tempView.Query = *query
	}

	if format != nil {
		tempView.Format = *format
	}

	sqlView, err := toSQLView(tempView)
	if err != nil {
		return err
	}

	toUpdate := map[string]interface{}{}
	if title != nil {
		toUpdate["Title"] = *title
	}
	if query != nil {
		toUpdate["Query"] = sqlView.QueryJSON
	}
	if format != nil {
		toUpdate["Format"] = sqlView.FormatJSON
	}

	_, err = p.store.execBuilder(tx, sq.
		Update("PROP_View").
		SetMap(toUpdate).
		Where(sq.Eq{"ID": id}))

	if err != nil {
		return errors.Wrapf(err, "failed to update view with id '%s'", id)
	}

	if err = tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}

func (p *viewStore) QueryObjects(query app.Query, page int, perPage int) ([]string, error) {
	if len(query.Includes) == 0 && len(query.Excludes) == 0 {
		return []string{}, errors.New("Fields must have at least one value")
	}

	tx, err := p.store.db.Beginx()
	if err != nil {
		return []string{}, errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	where := sq.And{}
	for id, fields := range query.Includes {
		if len(fields) == 0 {
			where = append(where, sq.Expr("p.Properties::jsonb ?? ?", id))
			continue
		}

		if len(fields) == 1 {
			where = append(where, sq.Expr("p.Properties::jsonb->? ?? ?", id, fields[0]))
			continue
		}

		fieldsList := "p.Properties::jsonb->? ??| array[? "
		fieldsInterface := make([]interface{}, len(fields)+1)
		fieldsInterface[0] = id
		for i, value := range fields {
			if i < len(fields)-1 {
				fieldsList += ", ?"
			}
			fieldsInterface[i+1] = value
		}
		fieldsList += "]"
		where = append(where, sq.Expr(fieldsList, fieldsInterface...))
	}

	for id, fields := range query.Excludes {
		if len(fields) == 0 {
			where = append(where, sq.Expr("NOT(p.Properties::jsonb ?? ?)", id))
			continue
		}

		if len(fields) == 1 {
			where = append(where, sq.Expr("NOT(p.Properties::jsonb->? ?? ?)", id, fields[0]))
			continue
		}

		fieldsList := "NOT(p.Properties::jsonb->? ??| array[? "
		fieldsInterface := make([]interface{}, len(fields)+1)
		fieldsInterface[0] = id
		for i, value := range fields {
			if i < len(fields)-1 {
				fieldsList += ", ?"
			}
			fieldsInterface[i+1] = value
		}
		fieldsList += "])"
		where = append(where, sq.Expr(fieldsList, fieldsInterface...))
	}

	if query.ChannelID != "" {
		where = append(where, sq.Eq{"p.ChannelID": query.ChannelID})
	}

	if query.TeamID != "" {
		where = append(where, sq.Eq{"p.TeamID": query.TeamID})
	}

	if page < 0 {
		page = 0
	}
	if perPage < 0 {
		perPage = 0
	}

	//TODO: handle different object types & consider view performance
	q := sq.
		Select(
			"p.ObjectID",
		).
		From("PROP_Property_Query_View p").
		Where(where).
		Offset(uint64(page * perPage)).
		Limit(uint64(perPage))

	str, _, _ := q.ToSql()
	fmt.Println(str)

	var ids []string
	err = p.store.selectBuilder(tx, &ids, q)

	if err == sql.ErrNoRows {
		return []string{}, errors.Wrap(app.ErrNotFound, "no objects exist for query")
	} else if err != nil {
		return []string{}, errors.Wrap(err, "failed to get objects by query")
	}

	if err = tx.Commit(); err != nil {
		return nil, errors.Wrap(err, "could not commit transaction")
	}

	return ids, nil
}

func toSQLView(view app.View) (*sqlView, error) {
	queryJSON, err := json.Marshal(view.Query)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal query json for view id: '%s'", view.ID)
	}

	if len(queryJSON) > maxJSONLength {
		return nil, errors.Errorf("query json for view id '%s' is too long (max %d)", view.ID, maxJSONLength)
	}

	formatJSON, err := json.Marshal(view.Format)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal format json for view id: '%s'", view.ID)
	}

	if len(formatJSON) > maxJSONLength {
		return nil, errors.Errorf("format json for view id '%s' is too long (max %d)", view.ID, maxJSONLength)
	}

	return &sqlView{
		View:       view,
		QueryJSON:  queryJSON,
		FormatJSON: formatJSON,
	}, nil
}

func toView(rawView sqlView) (app.View, error) {
	p := rawView.View
	if len(rawView.QueryJSON) > 0 {
		if err := json.Unmarshal(rawView.QueryJSON, &p.Query); err != nil {
			return app.View{}, errors.Wrapf(err, "failed to unmarshal query json for view id: '%s'", rawView.ID)
		}
	}

	if len(rawView.FormatJSON) > 0 {
		if err := json.Unmarshal(rawView.FormatJSON, &p.Format); err != nil {
			return app.View{}, errors.Wrapf(err, "failed to unmarshal format json for view id: '%s'", rawView.ID)
		}
	}

	return p, nil
}
