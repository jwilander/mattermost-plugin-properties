package app

type PropertyField struct {
	ID     string        `json:"id"`
	Name   string        `json:"name"`
	Type   string        `json:"type"`
	Values []interface{} `json:"values" db:"-"`
}

type PropertyFieldStore interface {
	Get(id string) (PropertyField, error)
	Create(propertyField PropertyField) (string, error)
}

type PropertyFieldService interface {
	Get(id string) (PropertyField, error)
	Create(propertyField PropertyField) (string, error)
}
