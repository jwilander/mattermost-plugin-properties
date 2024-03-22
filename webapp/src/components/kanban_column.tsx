// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {ObjectWithProperties} from 'src/types/property';

type KanbanProps = {
    objects: ObjectWithProperties[];
}

const Column = styled.div`
`;

const KanbanColumn = ({objects}: KanbanProps) => {
    return (
        <Column/>
    );
};

export default KanbanColumn;

