// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';

import {createProperty} from 'src/client';
import {Property} from 'src/types/property';
import {receivedProperty} from 'src/actions';
import FieldSelect, {FieldOption} from 'src/components/field_select';

interface Props {
    objectId: string;
    objectType: string;
    testId?: string
    className?: string;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function AddProperty(props: Props) {
    const dispatch = useDispatch();
    const onSelectedChange = async (value: FieldOption) => {
        let defaultValue = [] as string[];
        if (value.field.type === 'select') {
            defaultValue = value.field?.values ? [value.field.values[0]] : [];
        }
        const {id} = await createProperty(props.objectId, props.objectType, value.field.id, defaultValue);

        dispatch(receivedProperty({
            id,
            object_id: props.objectId,
            object_type: props.objectType,
            property_field_id: value.field.id,
            property_field_name: value.field.name,
            property_field_type: value.field.type,
            property_field_values: value.field.values,
            value: defaultValue,
        } as Property));
    };

    return (
        <FieldSelect
            testId={props.testId}
            className={props.className}
            buttonText='+'
            onOpenChange={props.onOpenChange}
            onSelectedChange={onSelectedChange}
        />
    );
}
