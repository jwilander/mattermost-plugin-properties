package app

type View struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Query    Query  `json:"query" db:"-"`
	CreateAt int64  `json:"create_at"`
}

type FieldValue []string

type Query struct {
	Fields map[string]FieldValue `json:"fields"`
}

type ViewStore interface {
	Create(view View) (string, error)
}

type ViewService interface {
	Create(view View) (string, error)
}
