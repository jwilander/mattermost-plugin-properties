// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@mattermost/types/lib/posts';

export type PropertyTypeEnum = 'text' | 'select' | 'user' | 'unknown';
export interface Property {
    id: string;
    object_id: string;
    object_type: string;
    property_field_id: string;
    readonly property_field_name: string;
    readonly property_field_type: PropertyTypeEnum;
    readonly property_field_values: string[] | null | undefined;
    value: string[];
}

export interface PropertyField {
    id: string;
    team_id: string;
    update_at: number;
    update_by: string;
    type: string;
    name: string;
    values: string[] | null | undefined;
}

export interface ViewQuery {
    fields: Record<string, string[]>;
}

export interface View {
    id: string;
    title: string;
    query: ViewQuery;
    create_at: number;
}

export interface ViewQueryResults {
    posts: Post[];
}
