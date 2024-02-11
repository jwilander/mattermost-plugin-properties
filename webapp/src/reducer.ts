// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {Property} from 'src/types/property';

import {
    RECEIVED_PROPERTIES_FOR_OBJECT,
    RECEIVED_PROPERTY_VALUE,
    ReceivedPropertiesForObject,
    ReceivedPropertyValue,
} from 'src/types/actions';

type TStateProperties = Record<Property['object_id'], Property[]>;

function properties(state: TStateProperties = {}, action: ReceivedPropertiesForObject | ReceivedPropertyValue) {
    switch (action.type) {
    case RECEIVED_PROPERTIES_FOR_OBJECT: {
        const a = action as ReceivedPropertiesForObject;
        const nextState = {...state};
        nextState[a.objectID] = a.properties;
        return nextState;
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

const reducer = combineReducers({
    properties,
});

export default reducer;

export type PropertiesPluginState = ReturnType<typeof reducer>;
