// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import styled from 'styled-components';
import withScrolling, {createHorizontalStrength, createVerticalStrength} from 'react-dnd-scrolling';

import {ObjectWithProperties, Property, ViewFormat} from 'src/types/property';
import {getPropertyField} from 'src/selectors';
import KanbanColumnHeader from 'src/components/kanban_column_header';
import {createProperty, deleteProperty, updatePropertyValue} from 'src/client';
import {deletedProperty, receivedProperty, receivedPropertyValue} from 'src/actions';

import KanbanColumn from './kanban_column';

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
    min-height: 90%;
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
    padding-left: 1px;
`;

const getObjectsByGroupByField = (fieldID: string, vals: string[], objs: ObjectWithProperties[]) => {
    const result = {} as Record<string, ObjectWithProperties[]>;
    vals.forEach((v) => {
        result[v] = [];
    });
    objs.forEach((o) => {
        const property = o.properties.find((p) => p.property_field_id === fieldID);
        if (property == null) {
            result[''].push(o);
            return;
        }

        if (property.value.length === 0) {
            result[''].push(o);
            return;
        }
        result[property.value[0]].push(o);
    });
    return result;
};

const emptyValues = [] as string[];

const Kanban = ({id, objects, format}: KanbanProps) => {
    const dispatch = useDispatch();
    const groupByField = useSelector(getPropertyField(format.group_by_field_id));
    const groupByFieldValues = groupByField.values || emptyValues;
    const values = useMemo(() => ([...groupByFieldValues, '']), [groupByFieldValues]);
    const objectsByValue = useMemo(() => getObjectsByGroupByField(format.group_by_field_id, values, objects), [format.group_by_field_id, values, objects]);

    const onDropToColumn = (value: string, object: ObjectWithProperties) => {
        const property = object.properties.find((p) => p.property_field_id === groupByField.id);
        if (property == null) {
            createProperty(object.id, object.type, groupByField.id, [value]).then(
                () => {
                    dispatch(receivedProperty({
                        id,
                        object_id: object.id,
                        object_type: object.type,
                        property_field_id: groupByField.id,
                        property_field_name: groupByField.name,
                        property_field_type: groupByField.type,
                        property_field_values: groupByField.values,
                        value: [value],
                    } as Property));
                },
            );
            return;
        }

        if (!value) {
            deleteProperty(property.id).then(
                () => {
                    dispatch(deletedProperty(property.id, object.id));
                },
            );
            return;
        }

        updatePropertyValue(property.id, [value]).then(
            () => {
                dispatch(receivedPropertyValue(property.id, object.id, [value]));
            },
        );
    };

    const onDropToCard = (srcObject: ObjectWithProperties, dstObject: ObjectWithProperties) => {
        const dstProperty = dstObject.properties.find((p) => p.property_field_id === groupByField.id);
        const srcProperty = srcObject.properties.find((p) => p.property_field_id === groupByField.id);
        if (dstProperty == null && srcProperty == null) {
            return;
        }

        if (dstProperty && srcProperty == null) {
            createProperty(srcObject.id, srcObject.type, groupByField.id, dstProperty.value).then(
                () => {
                    dispatch(receivedProperty({
                        id,
                        object_id: srcObject.id,
                        object_type: srcObject.type,
                        property_field_id: groupByField.id,
                        property_field_name: groupByField.name,
                        property_field_type: groupByField.type,
                        property_field_values: groupByField.values,
                        value: dstProperty.value,
                    } as Property));
                },
            );
            return;
        }

        if (srcProperty && dstProperty == null) {
            deleteProperty(srcProperty.id).then(
                () => {
                    dispatch(deletedProperty(srcProperty.id, srcObject.id));
                },
            );
            return;
        }

        //TODO: find better way to make typescript know these are not null, previous checks should be sufficient
        if (dstProperty == null || srcProperty == null) {
            return;
        }

        updatePropertyValue(srcProperty.id, dstProperty.value).then(
            () => {
                dispatch(receivedPropertyValue(srcProperty.id, srcObject.id, dstProperty.value));
            },
        );
    };

    return (
        <Board
            className='KanbanBoard'
            horizontalStrength={hStrength}
            verticalStrength={vStrength}
        >
            <BoardHeader className='KanbanBoardHeader'>
                {values.map((v) => (
                    <KanbanColumnHeader
                        key={`column-header-${id}-${v}`}
                        value={v || `No ${groupByField.name}`}
                    />
                ))}
            </BoardHeader>
            <BoardBody className='KanbanBoardBody'>
                {values.map((v) => (
                    <KanbanColumn
                        key={`column-${id}-${v}`}
                        objects={objectsByValue[v]}
                        onDrop={(object: ObjectWithProperties) => onDropToColumn(v, object)}
                        onDropToCard={onDropToCard}
                    />
                ))}
            </BoardBody>
        </Board>
    );
};

export default Kanban;

