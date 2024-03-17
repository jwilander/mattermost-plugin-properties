package app

import (
	"github.com/mattermost/mattermost/server/public/model"
)

type View struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Query    Query  `json:"query" db:"-"`
	CreateAt int64  `json:"create_at"`
}

type ViewMember struct {
	ViewID string `json:"view_id"`
	UserID string `json:"user_id"`
}

type Query struct {
	Exists   map[string]bool     `json:"exists"`
	Includes map[string][]string `json:"includes"`
	Excludes map[string][]string `json:"excludes"`
}

type Objects struct {
	Posts []*model.Post `json:"posts"`
}

type ViewStore interface {
	Create(view View) (string, error)
	QueryObjects(query Query, page int, perPage int) ([]string, error)
	Get(id string) (View, error)
	GetForUser(userID string) ([]View, error)
}

type ViewMemberStore interface {
	Create(member ViewMember) error
}

type ViewService interface {
	Create(view View) (string, error)
	GetObjectsForView(id string, page int, perPage int) (Objects, error)
	AddUserToView(userID string, viewID string) error
	GetForUser(userId string) ([]View, error)
}
