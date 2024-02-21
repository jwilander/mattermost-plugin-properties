package app

type Property struct {
	ID                  string        `json:"id"`
	ObjectID            string        `json:"object_id"`
	ObjectType          string        `json:"object_type"`
	PropertyFieldID     string        `json:"property_field_id"`
	PropertyFieldName   string        `json:"property_field_name"`
	PropertyFieldType   string        `json:"property_field_type"`
	PropertyFieldValues []interface{} `json:"property_field_values"`
	Value               []interface{} `json:"value" db:"-"`
}

const (
	PropertyObjectTypePost    = "post"
	PropertyObjectTypeChannel = "channel"
)

type PropertyStore interface {
	GetByObjectID(objectID string) ([]Property, error)
	Create(property Property) (string, error)
	UpdateValue(id string, value []interface{}) error
	Delete(id string) error
}

type PropertyService interface {
	Create(property Property) (string, error)
	GetForObject(objectID string) ([]Property, error)
	UpdateValue(id string, value []interface{}) error
	Delete(id string) error
}
