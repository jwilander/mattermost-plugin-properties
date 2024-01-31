package sqlstore

import (
	"testing"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/stretchr/testify/require"
)

func TestHasPrimaryKeys(t *testing.T) {
	t.Run("MySQL", func(t *testing.T) {
		db := setupTestDB(t, model.DatabaseDriverMysql)
		//setupPlaybookStore(t, db) // To run the migrations and everything
		tablesWithoutPrimaryKeys := []string{}
		err := db.Select(&tablesWithoutPrimaryKeys, `
			SELECT tab.table_name
				   AS tablename
			FROM   information_schema.tables tab
				   LEFT JOIN information_schema.table_constraints tco
						  ON tab.table_schema = tco.table_schema
							 AND tab.table_name = tco.table_name
							 AND tco.constraint_type = 'PRIMARY KEY'
				   LEFT JOIN information_schema.key_column_usage kcu
						  ON tco.constraint_schema = kcu.constraint_schema
							 AND tco.constraint_name = kcu.constraint_name
							 AND tco.table_name = kcu.table_name
			WHERE tab.table_schema = (SELECT DATABASE())
			AND tco.constraint_name is NULL
			GROUP  BY tab.table_schema,
					  tab.table_name,
					  tco.constraint_name
		`)
		require.Len(t, tablesWithoutPrimaryKeys, 0)
		require.NoError(t, err)
	})

	t.Run("Postgres", func(t *testing.T) {
		db := setupTestDB(t, model.DatabaseDriverPostgres)
		//setupPlaybookStore(t, db) // To run the migrations and everything
		tablesWithoutPrimaryKeys := []string{}
		err := db.Select(&tablesWithoutPrimaryKeys, `
			SELECT tab.table_name AS pk_name
			FROM   information_schema.tables tab
				   LEFT JOIN information_schema.table_constraints tco
						  ON tco.table_schema = tab.table_schema
							 AND tco.table_name = tab.table_name
							 AND tco.constraint_type = 'PRIMARY KEY'
				   LEFT JOIN information_schema.key_column_usage kcu
						  ON kcu.constraint_name = tco.constraint_name
							 AND kcu.constraint_schema = tco.constraint_schema
							 AND kcu.constraint_name = tco.constraint_name
			WHERE  tab.table_schema NOT IN ( 'pg_catalog', 'information_schema' )
				   AND tab.table_type = 'BASE TABLE'
				   AND tab.table_catalog = (SELECT current_database())
				   AND tco.constraint_name is NULL
			GROUP  BY tab.table_schema,
					  tab.table_name,
					  tco.constraint_name
		`)
		tablesToBeFiltered := []string{"teammembers"}
		for _, table := range tablesToBeFiltered {
			tablesWithoutPrimaryKeys = removeFromSlice(tablesWithoutPrimaryKeys, table)
		}
		require.Len(t, tablesWithoutPrimaryKeys, 0)
		require.NoError(t, err)
	})

}

func removeFromSlice(slice []string, item string) []string {
	for i, elem := range slice {
		if elem == item {
			return append(slice[:i], slice[i+1:]...)
		}
	}
	return slice
}
