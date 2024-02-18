// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useDispatch} from 'react-redux';

import {displayManageFieldsModal} from 'src/actions';

export const ManageButton = styled.button`
    display: flex;
    align-items: center;
    border: none;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    line-height: 12px;
    transition: all 0.15s ease;
    padding: 0 16px;
    height: 100%;

    :hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
    }

    :active {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
    }
`;

export default function AddProperty() {
    const dispatch = useDispatch();

    const openModal = () => dispatch(displayManageFieldsModal({}));

    return (
        <div
            data-testid='manage-fields'
            onClick={openModal}
        >
            <ManageButton
                onClick={openModal}
                className='ManageFields'
            >
                {'...'}
            </ManageButton>
        </div>
    );
}
