package app

type PropertyField struct {
	ID       string        `json:"id"`
	TeamID   string        `json:"team_id"`
	UpdateAt int64         `json:"update_at"`
	UpdateBy string        `json:"update_by"`
	Name     string        `json:"name"`
	Type     string        `json:"type"`
	Values   []interface{} `json:"values" db:"-"`
}

type PropertyFieldFilterOptions struct {
	TeamID                   string
	ExcludeHigherLevelFields bool
	SearchTerm               string
	Page                     int
	PerPage                  int
}

func (pf *PropertyField) IsTypeValid() bool {
	return pf.Type == PropertyFieldTypeText || pf.Type == PropertyFieldTypeSelect || pf.Type == PropertyFieldTypeUser || pf.Type == PropertyFieldTypePost
}

const (
	PropertyFieldTypeText   = "text"
	PropertyFieldTypeSelect = "select"
	PropertyFieldTypeUser   = "user"
	PropertyFieldTypePost   = "post"
)

type PropertyFieldStore interface {
	Get(id string) (PropertyField, error)
	Create(propertyField PropertyField) (string, error)
	GetFields(filter PropertyFieldFilterOptions) ([]PropertyField, error)
	Update(propertyField PropertyField) error
	Delete(id string) error
}

type PropertyFieldService interface {
	Get(id string) (PropertyField, error)
	Create(propertyField PropertyField) (string, error)
	GetFields(filter PropertyFieldFilterOptions) ([]PropertyField, error)
	Update(propertyField PropertyField) error
	Delete(id string) error
}
