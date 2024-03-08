package sqlstore

import (
	"github.com/jwilander/mattermost-plugin-properties/server/app"

	sq "github.com/Masterminds/squirrel"
	"github.com/pkg/errors"
)

type viewMemberStore struct {
	pluginAPI        PluginAPIClient
	store            *SQLStore
	queryBuilder     sq.StatementBuilderType
	viewMemberSelect sq.SelectBuilder
}

// Ensure viewMemberStore implements app.ViewMemberStore interface
var _ app.ViewMemberStore = (*viewMemberStore)(nil)

func NewViewMemberStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.ViewMemberStore {
	viewMemberSelect := sqlStore.builder.
		Select(
			"v.ViewID",
			"v.UserID",
		).
		From("PROP_ViewMember v")

	return &viewMemberStore{
		pluginAPI:        pluginAPI,
		store:            sqlStore,
		queryBuilder:     sqlStore.builder,
		viewMemberSelect: viewMemberSelect,
	}
}

func (p *viewMemberStore) Create(viewMember app.ViewMember) error {
	tx, err := p.store.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer p.store.finalizeTransaction(tx)

	_, err = p.store.execBuilder(tx, sq.
		Insert("PROP_ViewMember").
		SetMap(map[string]interface{}{
			"ViewID": viewMember.ViewID,
			"UserID": viewMember.UserID,
		}))
	if err != nil {
		return errors.Wrap(err, "failed to store new view member")
	}

	if err = tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}
