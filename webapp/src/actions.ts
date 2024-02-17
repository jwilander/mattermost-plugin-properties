// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Property} from 'src/types/property';

import {
    RECEIVED_PROPERTIES_FOR_OBJECT,
    RECEIVED_PROPERTY,
    RECEIVED_PROPERTY_VALUE,
    ReceivedPropertiesForObject,
    ReceivedProperty,
    ReceivedPropertyValue,
} from 'src/types/actions';

export const receivedPropertiesForObject = (objectID: string, properties: Property[]): ReceivedPropertiesForObject => ({
    type: RECEIVED_PROPERTIES_FOR_OBJECT,
    objectID,
    properties,
});

export const receivedProperty = (property: Property): ReceivedProperty => ({
    type: RECEIVED_PROPERTY,
    property,
});

export const receivedPropertyValue = (id: string, objectID: string, value: string[]): ReceivedPropertyValue => ({
    type: RECEIVED_PROPERTY_VALUE,
    id,
    objectID,
    value,
});
