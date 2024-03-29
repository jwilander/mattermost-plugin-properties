package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jwilander/mattermost-plugin-properties/server/app"
	"github.com/jwilander/mattermost-plugin-properties/server/config"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// PropertyHandler is the API handler.
type PropertyHandler struct {
	*ErrorHandler
	propertyService app.PropertyService
	pluginAPI       *pluginapi.Client
	config          config.Service
	permissions     *app.PermissionsService
}

// NewPropertyHandler returns a new property api handler
func NewPropertyHandler(router *mux.Router, propertyService app.PropertyService, api *pluginapi.Client, configService config.Service, permissions *app.PermissionsService) *PropertyHandler {
	handler := &PropertyHandler{
		ErrorHandler:    &ErrorHandler{},
		propertyService: propertyService,
		pluginAPI:       api,
		config:          configService,
		permissions:     permissions,
	}

	propertyRouter := router.PathPrefix("/property").Subrouter()

	propertyRouter.HandleFunc("", withContext(handler.createProperty)).Methods(http.MethodPost)
	propertyRouter.HandleFunc("/{id}", withContext(handler.updateProperty)).Methods(http.MethodPut)
	propertyRouter.HandleFunc("/{id}", withContext(handler.deleteProperty)).Methods(http.MethodDelete)
	propertyRouter.HandleFunc("/object/{objectID}", withContext(handler.getPropertiesForObject)).Methods(http.MethodGet)

	return handler
}

func (h *PropertyHandler) validProperty(w http.ResponseWriter, logger logrus.FieldLogger, property *app.Property) bool {
	if property.ObjectType != app.PropertyObjectTypePost && property.ObjectType != app.PropertyObjectTypeChannel {
		err := errors.New("Invalid object_type")
		h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
		return false
	}

	if property.ObjectID == "" {
		err := errors.New("Invalid object_id")
		h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
		return false
	}

	if property.PropertyFieldID == "" {
		err := errors.New("Invalid property_field_id")
		h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
		return false
	}

	//TODO: implement validate value

	return true
}

func (h *PropertyHandler) createProperty(c *Context, w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("Mattermost-User-ID")
	var property app.Property
	if err := json.NewDecoder(r.Body).Decode(&property); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode property", err)
		return
	}

	if property.ID != "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be blank", nil)
		return
	}

	if !h.validProperty(w, c.logger, &property) {
		return
	}

	if !h.PermissionsCheck(w, c.logger, h.permissions.PropertyCreate(userID, property)) {
		return
	}

	id, err := h.propertyService.Create(property)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	result := struct {
		ID string `json:"id"`
	}{
		ID: id,
	}
	w.Header().Add("Location", makeAPIURL(h.pluginAPI, "property/%s", id))

	ReturnJSON(w, &result, http.StatusCreated)
}

type UpdatePropertyValue struct {
	Value []interface{} `json:"value"`
}

func (h *PropertyHandler) updateProperty(c *Context, w http.ResponseWriter, r *http.Request) {
	//userID := r.Header.Get("Mattermost-User-ID")
	vars := mux.Vars(r)
	updateID := vars["id"]

	var update UpdatePropertyValue
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode property", err)
		return
	}

	if updateID == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be set", nil)
		return
	}

	//TODO: implement validate value

	//TODO: implement permission check for property update
	/*if !h.PermissionsCheck(w, c.logger, h.permissions.PropertyUpdate(userID, property)) {
		return
	}*/

	err := h.propertyService.UpdateValue(updateID, update.Value)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *PropertyHandler) getPropertiesForObject(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	objectID := vars["objectID"]

	if objectID == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "invalid object_id parameter", errors.New("objectID cannot be empty"))
		return
	}

	//TODO: implement permission check

	properties, err := h.propertyService.GetForObject(objectID)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	ReturnJSON(w, properties, http.StatusOK)
}

func (h *PropertyHandler) deleteProperty(c *Context, w http.ResponseWriter, r *http.Request) {
	//userID := r.Header.Get("Mattermost-User-ID")
	vars := mux.Vars(r)
	deleteID := vars["id"]

	if deleteID == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be set", nil)
		return
	}

	//TODO: implement validate value

	//TODO: implement permission check for property update
	/*if !h.PermissionsCheck(w, c.logger, h.permissions.PropertyDelete(userID, property)) {
		return
	}*/

	err := h.propertyService.Delete(deleteID)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
