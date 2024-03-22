// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import withScrolling, {createHorizontalStrength, createVerticalStrength} from 'react-dnd-scrolling';

import {ObjectWithProperties, ViewFormat} from 'src/types/property';
import {getPropertyField} from 'src/selectors';
import KanbanColumnHeader from 'src/components/kanban_column_header';

type KanbanProps = {
    id: string;
    objects: ObjectWithProperties[];
    format: ViewFormat;
}

const ScrollingComponent = withScrolling('div');
const hStrength = createHorizontalStrength(250);
const vStrength = createVerticalStrength(250);

const Board = styled(ScrollingComponent)`
    overflow: auto;
    flex: 1;
`;

const BoardHeader = styled.div`
    display: flex;
    flex-direction: row;
    width: max-content;
    min-height: 30px;
    padding: 16px 0;
    color: #909090;
    position: sticky;
    top: 0;
    background: rgb(var(--center-channel-bg-rgb));
`;
const BoardBody = styled.div`
    display: flex;
    flex-direction: row;
    flex: 0 1 auto;
    margin-top: 2px;
`;

const Kanban = ({id, posts, format}: KanbanProps) => {
    const groupByField = useSelector(getPropertyField(format.group_by_field_id));

    if (!groupByField) {
        return null;
    }

    useEffect(() => {
        console.log(format);
    }, []);

    const values = groupByField.values || [];

    return (
        <Board
            className='KanbanBoard'
            horizontalStrength={hStrength}
            verticalStrength={vStrength}
        >
            <BoardHeader className='KanbanBoardHeader'>
                {values.map((v) => (
                    <KanbanColumnHeader
                        key={`column-header-${v}`}
                        value={v}
                    />
                ))}
            </BoardHeader>
            <BoardBody className='KanbanBoardBody'/>
        </Board>
    );
};

export default Kanban;

