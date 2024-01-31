package sqlstore

import (
	"context"
	"embed"
	"fmt"
	"path/filepath"

	"github.com/mattermost/morph"
	"github.com/mattermost/morph/drivers"
	"github.com/mattermost/morph/sources"
	"github.com/mattermost/morph/sources/embedded"

	ps "github.com/mattermost/morph/drivers/postgres"

	"github.com/mattermost/mattermost/server/public/model"
)

//go:embed migrations
var assets embed.FS

// RunMigrations will run the migrations (if any). The caller should hold a cluster mutex if there
// is a danger of this being run on multiple servers at once.
func (sqlStore *SQLStore) RunMigrations() error {
	if err := sqlStore.runMigrationsWithMorph(); err != nil {
		return fmt.Errorf("failed to complete migrations (with morph): %w", err)
	}

	return nil
}

func (sqlStore *SQLStore) migrate(direction migrationDirection) error {
	engine, err := sqlStore.createMorphEngine()
	if err != nil {
		return err
	}
	defer engine.Close()

	switch direction {
	case migrationsDirectionDown:
		_, err = engine.ApplyDown(-1)
		return err
	default:
		return engine.ApplyAll()
	}
}

func (sqlStore *SQLStore) createDriver() (drivers.Driver, error) {
	driverName := sqlStore.db.DriverName()

	var driver drivers.Driver
	var err error
	switch driverName {
	case model.DatabaseDriverPostgres:
		driver, err = ps.WithInstance(sqlStore.db.DB)
	default:
		err = fmt.Errorf("unsupported database type %s for migration", driverName)
	}
	return driver, err
}

func (sqlStore *SQLStore) createSource() (sources.Source, error) {
	driverName := sqlStore.db.DriverName()
	assetsList, err := assets.ReadDir(filepath.Join("migrations", driverName))
	if err != nil {
		return nil, err
	}

	assetNamesForDriver := make([]string, len(assetsList))
	for i, entry := range assetsList {
		assetNamesForDriver[i] = entry.Name()
	}

	src, err := embedded.WithInstance(&embedded.AssetSource{
		Names: assetNamesForDriver,
		AssetFunc: func(name string) ([]byte, error) {
			return assets.ReadFile(filepath.Join("migrations", driverName, name))
		},
	})

	return src, err
}

func (sqlStore *SQLStore) createMorphEngine() (*morph.Morph, error) {
	src, err := sqlStore.createSource()
	if err != nil {
		return nil, err
	}

	driver, err := sqlStore.createDriver()
	if err != nil {
		return nil, err
	}

	opts := []morph.EngineOption{
		morph.WithLock("mm-properties-lock-key"),
		morph.SetMigrationTableName("PROP_db_migrations"),
		morph.SetStatementTimeoutInSeconds(100000),
	}
	engine, err := morph.New(context.Background(), driver, src, opts...)

	return engine, err
}

func (sqlStore *SQLStore) runMigrationsWithMorph() error {
	engine, err := sqlStore.createMorphEngine()
	if err != nil {
		return err
	}
	defer engine.Close()

	if err := engine.ApplyAll(); err != nil {
		return fmt.Errorf("could not apply migrations: %w", err)
	}

	return nil
}
