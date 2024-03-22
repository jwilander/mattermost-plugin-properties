package main

import (
	"net/http"

	root "github.com/jwilander/mattermost-plugin-properties"
	"github.com/jwilander/mattermost-plugin-properties/server/api"
	"github.com/jwilander/mattermost-plugin-properties/server/app"
	"github.com/jwilander/mattermost-plugin-properties/server/config"
	"github.com/jwilander/mattermost-plugin-properties/server/sqlstore"

	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"
	"github.com/pkg/errors"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	handler              *api.Handler
	config               *config.ServiceImpl
	pluginAPI            *pluginapi.Client
	propertyService      app.PropertyService
	propertyFieldService app.PropertyFieldService
	viewService          app.ViewService
	permissions          *app.PermissionsService
}

func (p *Plugin) OnActivate() error {

	pluginAPIClient := pluginapi.NewClient(p.API, p.Driver)
	p.pluginAPI = pluginAPIClient

	p.config = config.NewConfigService(pluginAPIClient, &root.Manifest)

	apiClient := sqlstore.NewClient(pluginAPIClient)

	sqlStore, err := sqlstore.New(apiClient)
	if err != nil {
		return errors.Wrapf(err, "failed creating the SQL store")
	}

	propertyFieldStore := sqlstore.NewPropertyFieldStore(apiClient, sqlStore)
	propertyStore := sqlstore.NewPropertyStore(apiClient, sqlStore)
	viewStore := sqlstore.NewViewStore(apiClient, sqlStore)
	viewMemberStore := sqlstore.NewViewMemberStore(apiClient, sqlStore)

	p.propertyFieldService = app.NewPropertyFieldService(propertyFieldStore, pluginAPIClient)
	p.propertyService = app.NewPropertyService(propertyStore, p.propertyFieldService, pluginAPIClient)
	p.viewService = app.NewViewService(viewStore, viewMemberStore, p.propertyService, pluginAPIClient)

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

	p.handler = api.NewHandler(pluginAPIClient, p.config)
	p.permissions = app.NewPermissionsService(p.propertyService, p.propertyFieldService, pluginAPIClient, p.config)

	api.NewPropertyHandler(
		p.handler.APIRouter,
		p.propertyService,
		pluginAPIClient,
		p.config,
		p.permissions,
	)

	api.NewPropertyFieldHandler(
		p.handler.APIRouter,
		p.propertyFieldService,
		pluginAPIClient,
		p.config,
		p.permissions,
	)

	api.NewViewHandler(
		p.handler.APIRouter,
		p.viewService,
		pluginAPIClient,
		p.config,
		p.permissions,
	)

	return nil
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.handler.ServeHTTP(w, r)
}

// See https://developers.mattermost.com/extend/plugins/server/reference/
