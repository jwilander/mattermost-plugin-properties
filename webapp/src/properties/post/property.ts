// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PropertyType} from 'src/properties/types';
import {PropertyTypeEnum} from 'src/types/property';

import Post from './post';

export default class PostProperty extends PropertyType {
    Editor = Post;
    name = 'Post';
    type = 'post' as PropertyTypeEnum;
    displayName = 'Post';
}
