package sqlstore

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRebind(t *testing.T) {
	cases := []struct {
		Query    string
		Expected string
		BindType int
	}{
		{
			Query:    "SELECT p.ID FROM PROP_Property p WHERE p.PropertyFieldID = ? AND p.Value::jsonb ?? ?",
			Expected: "SELECT p.ID FROM PROP_Property p WHERE p.PropertyFieldID = $1 AND p.Value::jsonb ? $2",
			BindType: DOLLAR,
		},
		{
			Query:    "SELECT p.ID FROM PROP_Property p WHERE p.PropertyFieldID = ? AND p.Value::jsonb ??| array[?, ?]",
			Expected: "SELECT p.ID FROM PROP_Property p WHERE p.PropertyFieldID = $1 AND p.Value::jsonb ?| array[$2, $3]",
			BindType: DOLLAR,
		},
	}

	for _, c := range cases {
		assert.Equal(t, c.Expected, Rebind(c.BindType, c.Query))
	}

}

func removeFromSlice(slice []string, item string) []string {
	for i, elem := range slice {
		if elem == item {
			return append(slice[:i], slice[i+1:]...)
		}
	}
	return slice
}
