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

export interface ObjectWithProperties {
    id: string;
    type: string;
    properties: Property[];
    content: string;
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
    includes: Record<string, string[]>;
    excludes: Record<string, string[]>;
    channel_id: string;
    team_id: string;
}

export interface ViewFormat {
    order: string[];
    group_by_field_id: string;
    hidden_value_ids: string[];
}

export type ViewTypeEnum = 'list' | 'kanban';

export interface View {
    id: string;
    title: string;
    type: ViewTypeEnum;
    query: ViewQuery;
    format: ViewFormat;
    create_at: number;
}

export interface ViewQueryResults {
    posts: Post[];
    properties: Record<string, Property[]>;
}
