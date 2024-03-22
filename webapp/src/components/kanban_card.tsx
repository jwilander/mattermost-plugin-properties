// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import styled, {css} from 'styled-components';

import {useSortable} from 'src/hooks/sortable';
import {ObjectWithProperties, Property} from 'src/types/property';

type KanbanProps = {
    object: ObjectWithProperties;
    titleFieldId?: string;
    onDrop: (srcObject: ObjectWithProperties, dstObject: ObjectWithProperties) => void;
}

const Card = styled.div<{dragover: boolean, dragging: boolean}>`
    flex: 0 0 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow-wrap: anywhere;
    border-radius: 4px;
    margin-bottom: 16px;
    padding: 12px 16px;
    box-shadow: rgba(var(--center-channel-color-rgb), 0.1) 0 0 0 1px,
        rgba(var(--center-channel-color-rgb), 0.1) 0 2px 4px;

    cursor: pointer;
    color: rgb(var(--center-channel-color-rgb));

    transition: background 100ms ease-out 0s;

    &:hover {
        background-color: rgba(var(--center-channel-color-rgb), 0.08);

    }

    &.selected {
        background-color: rgba(90, 200, 255, 0.2);
    }

    ${(props) => props.dragging && css`
        opacity: 0.5;
    `}

    ${(props) => props.dragover && css`
        background-color: rgba(128, 192, 255, 0.15);
    `}
`;

const Title = styled.div`
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 100px;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
`;

const KanbanCard = ({object, titleFieldId, onDrop}: KanbanProps) => {
    const [isDragging, isOver, cardRef] = useSortable('card', object, true, onDrop);
    const propertyForTitle = useMemo(() => object.properties.find((p) => p.property_field_id === titleFieldId), [object.properties, titleFieldId]);

    let title = object.content;
    if (propertyForTitle && propertyForTitle.property_field_type === 'text') {
        title = propertyForTitle.value[0];
    }

    return (
        <Card
            ref={cardRef}
            draggable={true}
            dragging={isDragging}
            dragover={isOver}
            className='KanbanCard'
        >
            <Title>
                {title}
            </Title>
        </Card>
    );
};

export default KanbanCard;

