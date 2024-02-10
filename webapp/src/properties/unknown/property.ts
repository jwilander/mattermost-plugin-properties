// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Text from 'src/properties/text/text';
import {PropertyType} from 'src/properties/types';
import {PropertyTypeEnum} from 'src/types/property';

export default class UnkownProperty extends PropertyType {
    Editor = Text;
    name = 'Text';
    type = 'unknown' as PropertyTypeEnum;
    displayName = 'Unknown';
}
