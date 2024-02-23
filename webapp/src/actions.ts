// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AnyAction, Dispatch} from 'redux';

import {Property, PropertyField} from 'src/types/property';

import {
    RECEIVED_PROPERTIES_FOR_OBJECT,
    RECEIVED_PROPERTY,
    RECEIVED_PROPERTY_FIELD,
    DELETED_PROPERTY,
    DELETED_PROPERTY_FIELD,
    RECEIVED_PROPERTY_VALUE,
    ReceivedPropertiesForObject,
    ReceivedProperty,
    DeletedProperty,
    DeletedPropertyField,
    ReceivedPropertyValue,
    ReceivedPropertyField,
} from 'src/types/actions';

import {ManageFieldsModalProps, makeManageFieldsModal} from 'src/components/manage_fields_modal';
import {modals} from 'src/webapp_globals';

export const receivedPropertiesForObject = (objectID: string, properties: Property[]): ReceivedPropertiesForObject => ({
    type: RECEIVED_PROPERTIES_FOR_OBJECT,
    objectID,
    properties,
});

export const receivedProperty = (property: Property): ReceivedProperty => ({
    type: RECEIVED_PROPERTY,
    property,
});

export const receivedPropertyField = (field: PropertyField): ReceivedPropertyField => ({
    type: RECEIVED_PROPERTY_FIELD,
    field,
});

export const deletedProperty = (id: string, objectID: string): DeletedProperty => ({
    type: DELETED_PROPERTY,
    id,
    objectID,
});

export const deletedPropertyField = (id: string): DeletedPropertyField => ({
    type: DELETED_PROPERTY_FIELD,
    id,
});

export const receivedPropertyValue = (id: string, objectID: string, value: string[]): ReceivedPropertyValue => ({
    type: RECEIVED_PROPERTY_VALUE,
    id,
    objectID,
    value,
});

export function displayManageFieldsModal(props: ManageFieldsModalProps) {
    return async (dispatch: Dispatch<AnyAction>) => {
        dispatch(modals.openModal(makeManageFieldsModal(props)));
    };
}
