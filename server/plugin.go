package main

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/jwilander/mattermost-plugin-properties/server/app"
	"github.com/jwilander/mattermost-plugin-properties/server/sqlstore"

	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"
	"github.com/pkg/errors"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration        *configuration
	pluginAPI            *pluginapi.Client
	propertyService      app.PropertyService
	propertyFieldService app.PropertyFieldService
}

func (p *Plugin) OnActivate() error {
	pluginAPIClient := pluginapi.NewClient(p.API, p.Driver)
	p.pluginAPI = pluginAPIClient

	apiClient := sqlstore.NewClient(pluginAPIClient)

	sqlStore, err := sqlstore.New(apiClient)
	if err != nil {
		return errors.Wrapf(err, "failed creating the SQL store")
	}

	propertyFieldStore := sqlstore.NewPropertyFieldStore(apiClient, sqlStore)
	propertyStore := sqlstore.NewPropertyStore(apiClient, sqlStore)

	p.propertyFieldService = app.NewPropertyFieldService(propertyFieldStore, pluginAPIClient)
	p.propertyService = app.NewPropertyService(propertyStore, p.propertyFieldService, pluginAPIClient)

	mutex, err := cluster.NewMutex(p.API, "PROP_dbMutex")
	if err != nil {
		return errors.Wrapf(err, "failed creating cluster mutex")
	}
	mutex.Lock()
	if err = sqlStore.RunMigrations(); err != nil {
		mutex.Unlock()
		return errors.Wrapf(err, "failed to run migrations")
	}
	mutex.Unlock()

	return nil
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello, world!")
}

// See https://developers.mattermost.com/extend/plugins/server/reference/
