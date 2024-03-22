// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

type KanbanProps = {
    value: string;
}

const ColumnHeader = styled.div`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    width: 260px;
    margin-right: 15px;
    vertical-align: middle;

    &.narrow {
        width: 220px;
    }

    > div {
        &:last-child {
            margin: 0;
        }
    }
`;

const Label = styled.span`
    max-width: 165px;
    margin: 0 8px 0 0;

    &.empty {
        color: rgba(var(--center-channel-color-rgb), 1);
        font-weight: 600;
    }
`;

const KanbanColumnHeader = ({value}: KanbanProps) => {
    return (
        <ColumnHeader className='KanbanColumnHeader'>
            <Label>
                {value}
            </Label>
        </ColumnHeader>
    );
};

export default KanbanColumnHeader;

