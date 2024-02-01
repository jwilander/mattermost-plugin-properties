package app

type Property struct {
	ID              string        `json:"id"`
	ObjectID        string        `json:"object_id"`
	PropertyFieldID string        `json:"property_field_id"`
	Value           []interface{} `json:"value" db:"-"`
}

type PropertyStore interface {
	GetByObjectID(objectID string) ([]Property, error)
	Create(property Property) (string, error)
}

type PropertyService interface {
}
