package app

type PropertyField struct {
	ID     string        `json:"id"`
	Name   string        `json:"name"`
	Type   string        `json:"type"`
	Values []interface{} `json:"values" db:"-"`
}

type PropertyFieldFilterOptions struct {
	SearchTerm string
	Page       int
	PerPage    int
}

const (
	PropertyFieldTypeText   = "text"
	PropertyFieldTypeSelect = "select"
	PropertyFieldTypeUser   = "user"
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
