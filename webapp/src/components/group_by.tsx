// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import styled from 'styled-components';

import {PropertyField, View} from 'src/types/property';
import FieldSelect, {FieldOption} from 'src/components/field_select';
import {getPropertyField} from 'src/selectors';
import {patchView} from '@/client';
import {receivedView} from '@/actions';

interface GroupByProps {
    view: View;
    onGroupByChange?: (newGroupByField: PropertyField) => void;
}

export default function GroupBy({view, onGroupByChange}: GroupByProps) {
    const dispatch = useDispatch();
    const format = view.format;
    const groupByField = useSelector(getPropertyField(format.group_by_field_id));

    const onSelectedChange = async (value: FieldOption) => {
        const newFormat = {...format, group_by_field_id: value.field.id};
        await patchView(view.id, null, null, newFormat);

        dispatch(receivedView({...view, format: newFormat}));

        onGroupByChange?.(value.field);
    };

    const filterNonSelectFields = (option: FieldOption) => option.field.type === 'select';

    return (
        <Container>
            <FieldSelect
                buttonText={
                    <Button>
                        {groupByField?.name ? `Group by: ${groupByField.name}` : 'Group by: <None>'}
                    </Button>
                }
                filter={filterNonSelectFields}
                onSelectedChange={onSelectedChange}
            />
        </Container>
    );
}

const Container = styled.div`
    margin-top: 15px;
`;

const Button = styled.div`
    padding: 10px;
`;
