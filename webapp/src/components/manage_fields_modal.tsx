import React, {ComponentProps, useCallback, useState} from 'react';
import styled from 'styled-components';

import {PropertyField} from 'src/types/property';
import GenericModal from 'src/widgets/generic_modal';

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

const ManageFieldsModal = (modalProps: ManageFieldsModalProps) => {
    const [tempFields, setTempFields] = useState([]);

    const onConfirm = useCallback(() => {}, []);

    return (
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
            {'placeholder'}
        </SizedGenericModal>
    );
};
