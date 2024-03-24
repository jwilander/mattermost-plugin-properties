package app

import (
	"github.com/mattermost/mattermost/server/public/model"
)

type View struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Type     string `json:"type"`
	CreateAt int64  `json:"create_at"`
	Query    Query  `json:"query" db:"-"`
	Format   Format `json:"format" db:"-"`
}

const (
	ViewTypeList   = "list"
	ViewTypeKanban = "kanban"
	ViewTypeTree   = "tree"
)

type ViewMember struct {
	ViewID string `json:"view_id"`
	UserID string `json:"user_id"`
}
type Query struct {
	Includes  map[string][]string `json:"includes"`
	Excludes  map[string][]string `json:"excludes"`
	ChannelID string              `json:"channel_id"`
	TeamID    string              `json:"team_id"`
}

type Format struct {
	Order          []string `json:"order"`
	GroupByFieldID string   `json:"group_by_field_id"`
	HiddenValueIDs []string `json:"hidden_value_ids"`
	RootObjectID   string   `json:"root_object_id"`
}

type PropertiesList []Property

type Objects struct {
	Posts      []*model.Post             `json:"posts"`
	Properties map[string]PropertiesList `json:"properties"`
}

type ViewStore interface {
	Create(view View) (string, error)
	QueryObjects(query Query, page int, perPage int) ([]string, error)
	Get(id string) (View, error)
	GetForUser(userID string) ([]View, error)
	Update(id string, title *string, query *Query, format *Format) error
}

type ViewMemberStore interface {
	Create(member ViewMember) error
}

type ViewService interface {
	Create(view View) (string, error)
	GetObjectsForView(id string, page int, perPage int) (Objects, error)
	AddUserToView(userID string, viewID string) error
	GetForUser(userId string) ([]View, error)
	Update(id string, title *string, query *Query, format *Format) error
}
