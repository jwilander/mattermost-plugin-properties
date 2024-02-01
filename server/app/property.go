package app

type Property struct {
	ID                string        `json:"id"`
	ObjectID          string        `json:"object_id"`
	PropertyFieldID   string        `json:"property_field_id"`
	PropertyFieldName string        `json:"property_field_name"`
	Value             []interface{} `json:"value" db:"-"`
}

type PropertyStore interface {
	GetByObjectID(objectID string) ([]Property, error)
	Create(property Property) (string, error)
}

type PropertyService interface {
	Create(property Property) (string, error)
	GetForObject(objectID string) ([]Property, error)
}
