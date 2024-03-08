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
	Fields map[string][]string `json:"fields"`
}

type Objects struct {
	Posts []model.Post `json:"posts"`
}

type ViewStore interface {
	Create(view View) (string, error)
	QueryObjects(query Query) ([]string, error)
	Get(id string) (View, error)
	GetForUser(userID string) ([]View, error)
}

type ViewMemberStore interface {
	Create(member ViewMember) error
}

type ViewService interface {
	Create(view View) (string, error)
	GetObjectsForView(id string) (Objects, error)
	AddUserToView(userID string, viewID string) error
	GetForUser(userId string) ([]View, error)
}
