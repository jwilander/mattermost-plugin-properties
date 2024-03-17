// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {GlobalState} from '@mattermost/types/store';

import {PropertiesPluginState} from 'src/reducer';
import {manifest} from 'src/manifest';

// Assert known typing
const pluginState = (state: GlobalState): PropertiesPluginState => state['plugins-' + manifest.id as keyof GlobalState] as unknown as PropertiesPluginState || {} as PropertiesPluginState;

export const getProperties = (state: GlobalState) => pluginState(state).properties;

export const getPropertiesForObject = (objectId: string) => {
    return (state: GlobalState) => {
        return getProperties(state)[objectId] || [];
    };
};

export const getPropertyFields = (state: GlobalState) => pluginState(state).propertyFields;
