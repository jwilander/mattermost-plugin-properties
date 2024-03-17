// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import ReactSelect, {StylesConfig} from 'react-select';
import styled, {css} from 'styled-components';
import {useDispatch} from 'react-redux';
import {useUpdateEffect} from 'react-use';

import {createProperty, fetchPropertyFieldsForTerm} from 'src/client';
import Dropdown from 'src/components/dropdown';
import {Property, PropertyField} from 'src/types/property';
import {receivedProperty, receivedPropertyFields} from 'src/actions';

type ActionTypes = | 'clear' | 'create-option' | 'deselect-option' | 'pop-value' | 'remove-value' | 'select-option' | 'set-value';

export interface Option {
    value: string;
    label: JSX.Element | string;
    field: PropertyField;
}

interface ActionObj {
    action: ActionTypes;
}

interface Props {
    objectId: string;
    objectType: string;
    testId?: string
    className?: string;
    onOpenChange?: (isOpen: boolean) => void;
}

export const FilterButton = styled.button<{active?: boolean;}>`
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

    ${(props) => props.active && css`
        cursor: pointer;
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
    `}
`;

export default function AddProperty(props: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const [isOpen, setOpen] = useState(false);
    const toggleOpen = () => {
        if (!isOpen) {
            fetchPropertyFields();
        }
        setOpen(!isOpen);
    };

    const [options, setOptions] = useState<Option[]>([]);

    async function fetchPropertyFields() {
        const fields = await fetchPropertyFieldsForTerm('');

        dispatch(receivedPropertyFields(fields));

        const opts = fields.map((f) => ({value: f.id, label: f.name, field: f} as Option));
        setOptions(opts);
    }

    // Fill in the propertyFields on mount.
    useEffect(() => {
        //TODO: don't fetch on every mount
        fetchPropertyFields();
    }, []);

    useUpdateEffect(() => {
        props.onOpenChange?.(isOpen);
    }, [isOpen]);

    const onSelectedChange = async (value: Option | undefined) => {
        if (value == null) {
            return;
        }

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

        toggleOpen();
    };

    const components = {DropdownIndicator: null, IndicatorSeparator: null};

    const targetWrapped = (
        <div
            data-testid={props.testId}
            onClick={toggleOpen}
            className={props.className}
        >
            <FilterButton
                active={isOpen}
                onClick={toggleOpen}
                className='AddProperty'
            >
                {'+'}
            </FilterButton>
        </div>
    );

    return (
        <Dropdown
            target={targetWrapped}
            placement='bottom-start'
            isOpen={isOpen}
            onOpenChange={setOpen}
        >
            <ReactSelect
                autoFocus={true}
                backspaceRemovesValue={false}
                components={components}
                controlShouldRenderValue={false}
                hideSelectedOptions={false}
                isClearable={false}
                menuIsOpen={true}
                options={options}
                placeholder={formatMessage({id: 'search', defaultMessage: 'Search'})}
                styles={selectStyles}
                tabSelectsValue={false}
                value={null}
                onChange={(option, action) => onSelectedChange(option as Option, action as ActionObj)}
                classNamePrefix='properties-react-select'
                className='properties-react-select'
            />
        </Dropdown>
    );
}

// styles for the select component
const selectStyles: StylesConfig<Option, boolean> = {
    control: (provided) => ({...provided, minWidth: 240, margin: 8}),
    menu: () => ({boxShadow: 'none'}),
    option: (provided, state) => {
        const hoverColor = 'rgba(20, 93, 191, 0.08)';
        const bgHover = state.isFocused ? hoverColor : 'transparent';
        return {
            ...provided,
            backgroundColor: state.isSelected ? hoverColor : bgHover,
            color: 'unset',
        };
    },
    groupHeading: (provided) => ({
        ...provided,
        fontWeight: 600,
    }),
};
