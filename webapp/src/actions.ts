// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Property} from 'src/types/property';

import {
    RECEIVED_PROPERTIES_FOR_OBJECT,
    ReceivedPropertiesForObject,
} from 'src/types/actions';

export const receivedPropertiesForObject = (objectID: string, properties: Property[]): ReceivedPropertiesForObject => ({
    type: RECEIVED_PROPERTIES_FOR_OBJECT,
    objectID,
    properties,
});
