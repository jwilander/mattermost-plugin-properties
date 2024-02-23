// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Property, PropertyField} from 'src/types/property';
import {manifest} from 'src/manifest';

export const RECEIVED_PROPERTIES_FOR_OBJECT = manifest.id + '_received_properties';
export const RECEIVED_PROPERTY = manifest.id + '_received_property';
export const RECEIVED_PROPERTY_FIELD = manifest.id + '_received_property_field';
export const DELETED_PROPERTY = manifest.id + '_deleted_property';
export const DELETED_PROPERTY_FIELD = manifest.id + '_deleted_property_field';
export const RECEIVED_PROPERTY_VALUE = manifest.id + '_received_property_value';

export interface ReceivedPropertiesForObject {
    type: typeof RECEIVED_PROPERTIES_FOR_OBJECT;
    objectID: string;
    properties: Property[];
}

export interface ReceivedProperty {
    type: typeof RECEIVED_PROPERTY;
    property: Property;
}

export interface ReceivedPropertyField {
    type: typeof RECEIVED_PROPERTY_FIELD;
    field: PropertyField;
}

export interface DeletedProperty {
    type: typeof DELETED_PROPERTY;
    id: string;
    objectID: string;
}

export interface DeletedPropertyField {
    type: typeof DELETED_PROPERTY_FIELD;
    id: string;
}

export interface ReceivedPropertyValue {
    type: typeof RECEIVED_PROPERTY_VALUE;
    id: string;
    objectID: string;
    value: string[];
}
