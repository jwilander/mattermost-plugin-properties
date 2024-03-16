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

// PropertyFieldHandler is the API handler.
type PropertyFieldHandler struct {
	*ErrorHandler
	propertyFieldService app.PropertyFieldService
	pluginAPI            *pluginapi.Client
	config               config.Service
	permissions          *app.PermissionsService
}

// NewPropertyFieldHandler returns a new propertyField api handler
func NewPropertyFieldHandler(router *mux.Router, propertyFieldService app.PropertyFieldService, api *pluginapi.Client, configService config.Service, permissions *app.PermissionsService) *PropertyFieldHandler {
	handler := &PropertyFieldHandler{
		ErrorHandler:         &ErrorHandler{},
		propertyFieldService: propertyFieldService,
		pluginAPI:            api,
		config:               configService,
		permissions:          permissions,
	}

	propertyFieldRouter := router.PathPrefix("/field").Subrouter()

	propertyFieldRouter.HandleFunc("", withContext(handler.createPropertyField)).Methods(http.MethodPost)
	propertyFieldRouter.HandleFunc("/{id}", withContext(handler.updatePropertyField)).Methods(http.MethodPut)
	propertyFieldRouter.HandleFunc("/{id}", withContext(handler.deletePropertyField)).Methods(http.MethodDelete)
	propertyFieldRouter.HandleFunc("/autocomplete", withContext(handler.getPropertyFieldsAutoComplete)).Methods(http.MethodGet)

	return handler
}

func (h *PropertyFieldHandler) validPropertyField(w http.ResponseWriter, logger logrus.FieldLogger, propertyField *app.PropertyField) bool {
	if propertyField.Type != app.PropertyFieldTypeText && propertyField.Type != app.PropertyFieldTypeSelect && propertyField.Type != app.PropertyFieldTypeUser {
		err := errors.New("Invalid type")
		h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
		return false
	}

	if propertyField.Name == "" {
		err := errors.New("Invalid name")
		h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
		return false
	}

	if len(propertyField.Values) > 0 {
		if propertyField.Type == app.PropertyFieldTypeText {
			err := errors.New("Invalid values: text type has no values")
			h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
			return false
		} else if propertyField.Type == app.PropertyFieldTypeUser {
			err := errors.New("Invalid values: user type has no values")
			h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
			return false
		} else if propertyField.Type == app.PropertyFieldTypeSelect {
			for _, v := range propertyField.Values {
				_, ok := v.(string)
				if !ok {
					err := errors.New("Invalid values: select type must have string values")
					h.HandleErrorWithCode(w, logger, http.StatusBadRequest, err.Error(), err)
					return false
				}
			}
		}
	}

	return true
}

func (h *PropertyFieldHandler) createPropertyField(c *Context, w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("Mattermost-User-ID")

	var propertyField app.PropertyField
	if err := json.NewDecoder(r.Body).Decode(&propertyField); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode property_field", err)
		return
	}

	propertyField.UpdateBy = userID

	if propertyField.ID != "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be blank", nil)
		return
	}

	if !h.validPropertyField(w, c.logger, &propertyField) {
		return
	}

	//TODO: implement permission check for property field
	/*if !h.PermissionsCheck(w, c.logger, h.permissions.PropertyFieldCreate(userID, propertyField)) {
		return
	}*/

	id, err := h.propertyFieldService.Create(propertyField)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	result := struct {
		ID string `json:"id"`
	}{
		ID: id,
	}
	w.Header().Add("Location", makeAPIURL(h.pluginAPI, "field/%s", id))

	ReturnJSON(w, &result, http.StatusCreated)
}

const maxPropertyFieldsToAutoComplete = 200

func (h *PropertyFieldHandler) getPropertyFieldsAutoComplete(c *Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	searchTerm := query.Get("term")
	teamID := query.Get("team_id")

	fields, err := h.propertyFieldService.GetFields(app.PropertyFieldFilterOptions{
		TeamID:                   teamID,
		ExcludeHigherLevelFields: false,
		SearchTerm:               searchTerm,
		Page:                     0,
		PerPage:                  maxPropertyFieldsToAutoComplete,
	})
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	ReturnJSON(w, fields, http.StatusOK)
}

func (h *PropertyFieldHandler) updatePropertyField(c *Context, w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("Mattermost-User-ID")

	var propertyField app.PropertyField
	if err := json.NewDecoder(r.Body).Decode(&propertyField); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode property_field", err)
		return
	}

	vars := mux.Vars(r)
	propertyField.ID = vars["id"]
	propertyField.UpdateBy = userID

	if propertyField.ID == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be set", nil)
		return
	}

	if !h.validPropertyField(w, c.logger, &propertyField) {
		return
	}

	//TODO: implement permission check for property field
	/*if !h.PermissionsCheck(w, c.logger, h.permissions.PropertyFieldUpdate(userID, propertyField)) {
		return
	}*/

	err := h.propertyFieldService.Update(propertyField)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *PropertyFieldHandler) deletePropertyField(c *Context, w http.ResponseWriter, r *http.Request) {
	//userID := r.Header.Get("Mattermost-User-ID")

	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "id must be set", nil)
		return
	}

	//TODO: implement permission check for property field
	/*if !h.PermissionsCheck(w, c.logger, h.permissions.PropertyFieldDelete(userID, propertyField)) {
		return
	}*/

	err := h.propertyFieldService.Delete(id)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
