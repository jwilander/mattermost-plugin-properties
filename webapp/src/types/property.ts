// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type PropertyTypeEnum = 'text' | 'select' | 'user' | 'unknown';
export interface Property {
    id: string;
    object_id: string;
    object_type: string;
    property_field_id: string;
    readonly property_field_name: string;
    readonly property_field_type: PropertyTypeEnum;
    readonly property_field_values: string[] | null;
    value: string[];
}

export interface PropertyField {
    id: string;
    type: string;
    name: string;
    values: string[] | null | undefined;
}
