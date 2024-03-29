package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jwilander/mattermost-plugin-properties/server/app"
	"github.com/jwilander/mattermost-plugin-properties/server/config"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"
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
	viewRouter.HandleFunc("/{id}", withContext(handler.patchView)).Methods(http.MethodPatch)
	viewRouter.HandleFunc("/{id}/query", withContext(handler.queryView)).Methods(http.MethodGet)
	viewRouter.HandleFunc("/user/{id}", withContext(handler.getForUser)).Methods(http.MethodGet)

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

const defaultQueryPerPage = 60

func (h *ViewHandler) queryView(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	query := r.URL.Query()
	pageStr := query.Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		page = 0
	}
	perPageStr := query.Get("per_page")
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil {
		perPage = defaultQueryPerPage
	}

	if id == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "invalid id parameter", errors.New("objectID cannot be empty"))
		return
	}

	//TODO: implement permission check

	objects, err := h.viewService.GetObjectsForView(id, page, perPage)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	ReturnJSON(w, objects, http.StatusOK)
}

func (h *ViewHandler) getForUser(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "invalid id parameter", errors.New("userID cannot be empty"))
		return
	}

	//TODO: implement permission check

	views, err := h.viewService.GetForUser(id)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	ReturnJSON(w, views, http.StatusOK)
}

type ViewPatch struct {
	Title  *string     `json:"title"`
	Query  *app.Query  `json:"query"`
	Format *app.Format `json:"format"`
}

func (h *ViewHandler) patchView(c *Context, w http.ResponseWriter, r *http.Request) {
	//userID := r.Header.Get("Mattermost-User-ID")
	vars := mux.Vars(r)
	id := vars["id"]

	var patch ViewPatch
	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode view patch", err)
		return
	}

	/* TODO: implement permissions check
	if !h.PermissionsCheck(w, c.logger, h.permissions.ViewCreate(userID, view)) {
		return
	}*/

	err := h.viewService.Update(id, patch.Title, patch.Query, patch.Format)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
