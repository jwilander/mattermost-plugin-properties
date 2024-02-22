import React, {ComponentProps, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {IntlProvider} from 'react-intl';

import {useDispatch} from 'react-redux';

import {PropertyField} from 'src/types/property';
import GenericModal from 'src/widgets/generic_modal';
import {createPropertyField, fetchPropertyFieldsForTerm, updatePropertyField} from 'src/client';
import Editable from 'src/widgets/editable';
import DeleteIcon from 'src/widgets/icons/delete';
import IconButton from 'src/widgets/buttons/icon_button';

import {receivedPropertyField} from '@/actions';

import AddPropertyField from './add_property_field';

const ID = 'manage_fields';

export type ManageFieldsModalProps = {
} & Partial<ComponentProps<typeof GenericModal>>;

export const makeManageFieldsModal = (props: ManageFieldsModalProps) => ({
    modalId: ID,
    dialogType: ManageFieldsModal,
    dialogProps: props,
});

const SizedGenericModal = styled(GenericModal)`
    width: 650px;
`;

const FieldsContainer = styled.table`
    width: 100%;
`;

const FieldRow = styled.tr`
    width: 100%;
`;

const Label = styled.td`
    line-height: 20px;
    color: rgba(var(--center-channel-color-rgb), 0.8);
    font-size: 13px;
    padding-bottom: 5px;
`;

const TitleLabel = styled(Label)`
    font-weight: 600;
    padding-bottom: 8px;
`;

const ManageFieldsModal = (modalProps: ManageFieldsModalProps) => {
    const dispatch = useDispatch();
    const [tempFields, setTempFields] = useState([] as PropertyField[]);
    const [origFields, setOrigFields] = useState([] as PropertyField[]);

    const onConfirm = useCallback(async () => {
        const fieldsToCreate = [] as PropertyField[];
        const fieldsToUpdate = tempFields.filter((f, index) => {
            const orig = origFields[index];
            if (orig == null) {
                fieldsToCreate.push(f);
                return false;
            }

            return f !== orig;
        });
        const updateRequests = fieldsToUpdate.map((f) => updatePropertyField(f.id, f.type, f.name, f.values));
        const createRequests = fieldsToCreate.map((f) => createPropertyField(f.name, f.type, f.values));
        await Promise.all(updateRequests);
        fieldsToUpdate.forEach((f) => dispatch(receivedPropertyField(f)));
        await Promise.all(createRequests);
    }, [origFields, tempFields, dispatch]);

    async function fetchPropertyFields(first?: boolean) {
        //TODO: implement dispatch to redux store
        const fields = await fetchPropertyFieldsForTerm('');
        setTempFields(fields);

        if (first) {
            setOrigFields(fields);
        }
    }

    const onFieldChange = (id: string, key: string, newValue: string | string[]) => {
        const newFields = [...tempFields];
        const index = newFields.findIndex((f) => f.id === id);
        const newField = {...newFields[index], [key]: newValue};
        newFields[index] = newField;
        setTempFields(newFields);
    };

    const onAddField = (type: string) => {
        setTempFields([...tempFields, {id: '', name: '', type, values: null}]);
    };

    useEffect(() => {
        fetchPropertyFields(true);
    }, []);

    return (
        <IntlProvider locale='en'>
            <SizedGenericModal
                id={ID}
                modalHeaderText='Manage fields'
                {...modalProps}
                confirmButtonText='Save'
                cancelButtonText='Cancel'
                isConfirmDisabled={false}
                handleConfirm={onConfirm}
                showCancel={true}
                autoCloseOnCancelButton={true}
                autoCloseOnConfirmButton={true}
            >
                <>
                    <FieldsContainer>
                        <FieldRow>
                            <TitleLabel>{'Name'}</TitleLabel>
                            <TitleLabel>{'Type'}</TitleLabel>
                            <TitleLabel>{'Values'}</TitleLabel>
                            <TitleLabel>{'Actions'}</TitleLabel>
                        </FieldRow>
                        {tempFields.map((f) => (
                            <FieldRow key={f.id}>
                                <td>
                                    <Editable
                                        value={f.name}
                                        onChange={(newValue) => onFieldChange(f.id, 'name', newValue)}
                                    />
                                </td>
                                <Label>{f.type}</Label>
                                {f.values ? (
                                    <td>
                                        <Editable
                                            value={f.values.join(',')}
                                            onChange={(newValue) => onFieldChange(f.id, 'values', newValue.trim().split(','))}
                                        />
                                    </td>) : <Label>{'-'}</Label>}
                                <td>
                                    <IconButton
                                        onClick={() => {}}
                                        icon={<DeleteIcon/>}
                                        title='Delete field'
                                    />
                                </td>
                            </FieldRow>
                        ))}
                    </FieldsContainer>
                    <AddPropertyField onAdd={onAddField}/>
                </>
            </SizedGenericModal>
        </IntlProvider>
    );
};
