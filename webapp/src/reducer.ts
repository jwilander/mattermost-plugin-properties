// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {Property} from 'src/types/property';

import {
    RECEIVED_PROPERTIES_FOR_OBJECT,
    ReceivedPropertiesForObject,
} from 'src/types/actions';

type TStateProperties = Record<Property['object_id'], Property[]>;

function properties(state: TStateProperties = {}, action: ReceivedPropertiesForObject) {
    switch (action.type) {
    case RECEIVED_PROPERTIES_FOR_OBJECT: {
        const nextState = {...state};
        nextState[action.objectID] = action.properties;
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
