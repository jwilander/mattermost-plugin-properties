package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jwilander/mattermost-plugin-properties/server/app"
	"github.com/jwilander/mattermost-plugin-properties/server/config"
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

// ViewHandler is the API handler.
type ViewHandler struct {
	*ErrorHandler
	viewService app.ViewService
	pluginAPI   *pluginapi.Client
	config      config.Service
	permissions *app.PermissionsService
}

// NewViewHandler returns a new view api handler
func NewViewHandler(router *mux.Router, viewService app.ViewService, api *pluginapi.Client, configService config.Service, permissions *app.PermissionsService) *ViewHandler {
	handler := &ViewHandler{
		ErrorHandler: &ErrorHandler{},
		viewService:  viewService,
		pluginAPI:    api,
		config:       configService,
		permissions:  permissions,
	}

	viewRouter := router.PathPrefix("/view").Subrouter()

	viewRouter.HandleFunc("", withContext(handler.createView)).Methods(http.MethodPost)

	return handler
}

func (h *ViewHandler) createView(c *Context, w http.ResponseWriter, r *http.Request) {
	//userID := r.Header.Get("Mattermost-User-ID")
	var view app.View
	if err := json.NewDecoder(r.Body).Decode(&view); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode view", err)
		return
	}

	if view.ID != "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be blank", nil)
		return
	}

	/* TODO: implement permissions check
	if !h.PermissionsCheck(w, c.logger, h.permissions.ViewCreate(userID, view)) {
		return
	}*/

	id, err := h.viewService.Create(view)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	result := struct {
		ID string `json:"id"`
	}{
		ID: id,
	}
	w.Header().Add("Location", makeAPIURL(h.pluginAPI, "view/%s", id))

	ReturnJSON(w, &result, http.StatusCreated)
}
