// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PropertyTypeEnum} from 'src/types/property';

export type PropertyProps = {
    id: string;
    value: string | string[]
    possibleValues: string[] | null;
    name: string;
    showEmptyPlaceholder: boolean
    readOnly: boolean;
    onChange: (value: string[]) => void;
}

export abstract class PropertyType {
    abstract Editor: React.FunctionComponent<PropertyProps>
    abstract name: string
    abstract type: PropertyTypeEnum
    abstract displayName: string;
}
