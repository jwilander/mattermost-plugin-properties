// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PropertyType} from 'src/properties/types';
import {PropertyTypeEnum} from 'src/types/property';

import User from './user';

export default class UserProperty extends PropertyType {
    Editor = User;
    name = 'User';
    type = 'user' as PropertyTypeEnum;
    displayName = 'User';
}
