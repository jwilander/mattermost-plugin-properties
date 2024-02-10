// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import CompassIcon from './compass_icon';

const Delete = styled(CompassIcon)`
    fill: rgba(var(--center-channel-color-rgb), 0.5);
    stroke: none;
    width: 24px;
    height: 24px;
`;

export default function DeleteIcon(): JSX.Element {
    return (
        <Delete
            icon='trash-can-outline'
            className='DeleteIcon trash-can-outline'
        />
    );
}
