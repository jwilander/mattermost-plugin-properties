// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PropertyType} from 'src/properties/types';
import {PropertyTypeEnum} from 'src/types/property';

import Select from './select';

export default class SelectProperty extends PropertyType {
    Editor = Select;
    name = 'Select';
    type = 'select' as PropertyTypeEnum;
    displayName = 'Select';
}
