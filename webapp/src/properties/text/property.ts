// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PropertyType} from 'src/properties/types';
import {PropertyTypeEnum} from 'src/types/property';

import Text from './text';

export default class TextProperty extends PropertyType {
    Editor = Text;
    name = 'Text';
    type = 'text' as PropertyTypeEnum;
    displayName = 'Text';
}
