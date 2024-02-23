package sqlstore

import (
	"encoding/json"

	"github.com/jwilander/mattermost-plugin-properties/server/app"

	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

type sqlView struct {
	app.View
	QueryJSON json.RawMessage `db:"query"`
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
			"v.CreateAt",
			"v.Query",
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
			"CreateAt": rawView.CreateAt,
			"Query":    rawView.QueryJSON,
		}))
	if err != nil {
		return "", errors.Wrap(err, "failed to store new view")
	}

	if err = tx.Commit(); err != nil {
		return "", errors.Wrap(err, "could not commit transaction")
	}

	return rawView.ID, nil
}

func toSQLView(view app.View) (*sqlView, error) {
	queryJSON, err := json.Marshal(view.Query)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal query json for view id: '%s'", view.ID)
	}

	if len(queryJSON) > maxJSONLength {
		return nil, errors.Errorf("query json for view id '%s' is too long (max %d)", view.ID, maxJSONLength)
	}

	return &sqlView{
		View:      view,
		QueryJSON: queryJSON,
	}, nil
}

func toView(rawView sqlView) (app.View, error) {
	p := rawView.View
	if len(rawView.QueryJSON) > 0 {
		if err := json.Unmarshal(rawView.QueryJSON, &p.Query); err != nil {
			return app.View{}, errors.Wrapf(err, "failed to unmarshal query json for view id: '%s'", rawView.ID)
		}
	}

	return p, nil
}
