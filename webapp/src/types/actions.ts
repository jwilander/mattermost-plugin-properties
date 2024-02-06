// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Property} from 'src/types/property';
import {manifest} from 'src/manifest';

export const RECEIVED_PROPERTIES_FOR_OBJECT = manifest.id + '_received_properties';

export interface ReceivedPropertiesForObject {
    type: typeof RECEIVED_PROPERTIES_FOR_OBJECT;
    objectID: string;
    properties: Property[];
}
