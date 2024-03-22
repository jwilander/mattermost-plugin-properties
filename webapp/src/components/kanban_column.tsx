// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled, {css} from 'styled-components';
import {useDrop, DropTargetMonitor} from 'react-dnd';

import {ObjectWithProperties} from 'src/types/property';

import KanbanCard from './kanban_card';

type KanbanProps = {
    objects: ObjectWithProperties[];
    onDrop: (object: ObjectWithProperties) => void;
    onDropToCard: (srcObject: ObjectWithProperties, dstObject: ObjectWithProperties) => void;
}

const Column = styled.div<{dragover?: boolean}>`
    flex: 0 0 auto;

    display: flex;
    flex-direction: column;

    width: 260px;
    margin-right: 15px;

    &.narrow {
        width: 220px;
    }

    ${(props) => props.dragover && css`
        background-color: rgba(128, 192, 255, 0.15);
    `}
`;

const KanbanColumn = ({objects, onDrop, onDropToCard}: KanbanProps) => {
    const [{isOver}, drop] = useDrop(() => ({
        accept: 'card',
        collect: (monitor: DropTargetMonitor) => ({
            isOver: monitor.isOver(),
        }),
        drop: (item: ObjectWithProperties, monitor: DropTargetMonitor) => {
            if (monitor.isOver({shallow: true})) {
                onDrop(item);
            }
        },
    }), [onDrop]);

    return (
        <Column
            ref={drop}
            className='KanbanColumn'
            dragover={isOver}
        >
            {objects.map((o) => (
                <KanbanCard
                    key={`card-${o.id}`}
                    object={o}
                    onDrop={onDropToCard}
                />
            ))}
        </Column>
    );
};

export default KanbanColumn;

