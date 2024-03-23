// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {manifest} from 'src/manifest';
import {ObjectWithoutProperties, Property, PropertyField, View} from 'src/types/property';

export const RECEIVED_PROPERTIES_FOR_OBJECT = manifest.id + '_received_properties';
export const RECEIVED_PROPERTY = manifest.id + '_received_property';
export const RECEIVED_PROPERTY_FIELD = manifest.id + '_received_property_field';
export const RECEIVED_PROPERTY_FIELDS = manifest.id + '_received_property_fields';
export const DELETED_PROPERTY = manifest.id + '_deleted_property';
export const DELETED_PROPERTY_FIELD = manifest.id + '_deleted_property_field';
export const RECEIVED_PROPERTY_VALUE = manifest.id + '_received_property_value';
export const RECEIVED_OBJECTS_FOR_VIEW = manifest.id + '_received_objects_for_view';
export const RECEIVED_VIEW = manifest.id + '_received_view';

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

export interface ReceivedPropertyFields {
    type: typeof RECEIVED_PROPERTY_FIELDS;
    fields: PropertyField[];
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

export interface ReceivedObjectsForView {
    type: typeof RECEIVED_OBJECTS_FOR_VIEW;
    viewID: string;
    objects: ObjectWithoutProperties[];
}

export interface ReceivedView {
    type: typeof RECEIVED_VIEW;
    view: View;
}
