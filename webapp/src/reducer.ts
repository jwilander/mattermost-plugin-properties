// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ObjectWithoutProperties, Property, PropertyField, View} from 'src/types/property';

import {
    DELETED_PROPERTY,
    RECEIVED_PROPERTIES_FOR_OBJECT,
    RECEIVED_PROPERTY,
    RECEIVED_PROPERTY_FIELD,
    RECEIVED_PROPERTY_FIELDS,
    RECEIVED_PROPERTY_VALUE,
    DELETED_PROPERTY_FIELD,
    DeletedProperty,
    ReceivedPropertiesForObject,
    ReceivedProperty,
    ReceivedPropertyField,
    ReceivedPropertyFields,
    ReceivedPropertyValue,
    DeletedPropertyField,
    ReceivedObjectsForView,
    RECEIVED_OBJECTS_FOR_VIEW,

} from 'src/types/actions';

type TStateProperties = Record<Property['object_id'], Property[]>;

function handleReceivedPropertyField(state: TStateProperties, field: PropertyField): TStateProperties {
    const nextState = {...state};
    let changed = false;
    Object.keys(state).forEach((objectID) => {
        const nextProps = [...nextState[objectID]];
        nextState[objectID].forEach((p, i) => {
            //TODO: only update if updateat is newer
            if (p.property_field_id === field.id) {
                nextProps[i] = {...p, property_field_name: field.name, property_field_values: field.values};
                changed = true;
            }
        });
        nextState[objectID] = nextProps;
    });
    if (changed) {
        return nextState;
    }
    return state;
}

function properties(state: TStateProperties = {}, action: ReceivedPropertiesForObject | ReceivedProperty | ReceivedPropertyField | ReceivedPropertyFields | ReceivedPropertyValue | DeletedProperty | DeletedPropertyField) {
    switch (action.type) {
    case RECEIVED_PROPERTIES_FOR_OBJECT: {
        const a = action as ReceivedPropertiesForObject;
        const nextState = {...state};
        nextState[a.objectID] = a.properties;
        return nextState;
    }
    case RECEIVED_PROPERTY: {
        const a = action as ReceivedProperty;
        const p = a.property;
        const nextState = {...state};
        if (!nextState[p.object_id]) {
            nextState[p.object_id] = [p];
            return nextState;
        }
        const nextProps = [...nextState[p.object_id]];
        const index = nextProps.findIndex((op) => op.id === p.id);
        if (index < 0) {
            nextProps.push(p);
        } else {
            nextProps[index] = p;
        }
        nextState[p.object_id] = nextProps;
        return nextState;
    }
    case RECEIVED_PROPERTY_FIELD: {
        const a = action as ReceivedPropertyField;
        const f = a.field;
        return handleReceivedPropertyField(state, f);
    }
    case RECEIVED_PROPERTY_FIELDS: {
        const a = action as ReceivedPropertyFields;
        let nextState = state;
        a.fields.forEach((f) => {
            nextState = handleReceivedPropertyField(nextState, f);
        });
        return nextState;
    }
    case DELETED_PROPERTY: {
        const a = action as DeletedProperty;
        const nextState = {...state};
        if (!nextState[a.objectID]) {
            return state;
        }
        const nextProps = [...nextState[a.objectID]];
        const index = nextProps.findIndex((p) => p.id === a.id);
        if (index < 0) {
            return state;
        }
        nextProps.splice(index, 1);
        nextState[a.objectID] = nextProps;
        return nextState;
    }
    case DELETED_PROPERTY_FIELD: {
        const a = action as DeletedPropertyField;
        const id = a.id;
        const nextState = {...state};
        let changed = false;
        Object.keys(state).forEach((objectID) => {
            let propsChanged = false;
            const nextProps = nextState[objectID].filter((p) => {
                if (p.property_field_id === id) {
                    changed = true;
                    propsChanged = true;
                    return false;
                }
                return true;
            });
            if (propsChanged) {
                nextState[objectID] = nextProps;
            }
        });
        if (changed) {
            return nextState;
        }
        return state;
    }
    case RECEIVED_PROPERTY_VALUE: {
        const a = action as ReceivedPropertyValue;
        const nextState = {...state};
        if (!nextState[a.objectID]) {
            return state;
        }
        const nextProps = [...nextState[a.objectID]];
        const index = nextProps.findIndex((p) => p.id === a.id);
        if (index < 0) {
            return state;
        }
        nextProps[index] = {...nextProps[index], value: a.value};
        nextState[a.objectID] = nextProps;
        return nextState;
    }
    default:
        return state;
    }
}

type TStatePropertyFields = Record<PropertyField['id'], PropertyField>;

function propertyFields(state: TStatePropertyFields = {}, action: ReceivedPropertyField | ReceivedPropertyFields | DeletedPropertyField) {
    switch (action.type) {
    case RECEIVED_PROPERTY_FIELD: {
        const a = action as ReceivedPropertyField;
        const nextState = {...state};
        nextState[a.field.id] = a.field;
        return nextState;
    }
    case RECEIVED_PROPERTY_FIELDS: {
        const a = action as ReceivedPropertyFields;
        const nextState = {...state};
        a.fields.forEach((f) => {
            nextState[f.id] = f;
        });
        return nextState;
    }
    case DELETED_PROPERTY_FIELD: {
        const a = action as DeletedPropertyField;
        if (state[a.id] == null) {
            return state;
        }
        const nextState = {...state};
        delete nextState[a.id];
        return nextState;
    }
    default:
        return state;
    }
}

type TStateObjectsForView = Record<View['id'], ObjectWithoutProperties[]>;

function objectsForView(state: TStateObjectsForView = {}, action: ReceivedObjectsForView) {
    switch (action.type) {
    case RECEIVED_OBJECTS_FOR_VIEW: {
        const a = action as ReceivedObjectsForView;
        const nextState = {...state};
        nextState[a.viewID] = a.objects;
        return nextState;
    }
    default:
        return state;
    }
}

const reducer = combineReducers({
    properties,
    propertyFields,
    objectsForView,
});

export default reducer;

export type PropertiesPluginState = ReturnType<typeof reducer>;
