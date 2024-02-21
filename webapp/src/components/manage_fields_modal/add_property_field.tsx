// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import ReactSelect, {StylesConfig} from 'react-select';
import styled, {css} from 'styled-components';
import {useUpdateEffect} from 'react-use';

import Dropdown from 'src/components/dropdown';

export interface Option {
    value: string;
    label: JSX.Element | string;
}

interface Props {
    testId?: string
    className?: string;
    onOpenChange?: (isOpen: boolean) => void;
    onAdd: (type: string) => void;
}

export const Button = styled.button<{active?: boolean;}>`
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
    padding: 4px 8px;
    height: 100%;
    margin-top: 20px;

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

const options = [
    {
        label: 'Text',
        value: 'text',
    },
    {
        label: 'Select',
        value: 'select',
    },
    {
        label: 'User',
        value: 'user',
    },
];

const components = {DropdownIndicator: null, IndicatorSeparator: null};

export default function AddPropertyField(props: Props) {
    const {formatMessage} = useIntl();

    const [isOpen, setOpen] = useState(false);
    const toggleOpen = () => {
        setOpen(!isOpen);
    };

    useUpdateEffect(() => {
        props.onOpenChange?.(isOpen);
    }, [isOpen]);

    const onSelectedChange = (option: Option) => {
        props.onAdd(option.value);
    };

    const targetWrapped = (
        <div
            data-testid={props.testId}
            onClick={toggleOpen}
            className={props.className}
        >
            <Button
                active={isOpen}
                onClick={toggleOpen}
                className='AddPropertyField'
            >
                {'+ '}
                <FormattedMessage
                    id='add_field'
                    defaultMessage='Add property field'
                />
            </Button>
        </div>
    );

    return (
        <Dropdown
            target={targetWrapped}
            placement='bottom-start'
            isOpen={isOpen}
            onOpenChange={setOpen}
            containerStyle={{zIndex: 9999}}
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
                onChange={(option) => onSelectedChange(option as Option)}
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
