// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {ActionMeta, OnChangeValue} from 'react-select';
import {FormatOptionLabelMeta} from 'react-select/base';
import CreatableSelect from 'react-select/creatable';
import {CSSObject} from '@emotion/serialize';

import Menu from './menu';
import MenuWrapper from './menu_wrapper';
import IconButton from './buttons/icon_button';
import OptionsIcon from './icons/options';
import DeleteIcon from './icons/delete';
import CloseIcon from './icons/close';
import Label from './label';

export type PropertyOption = {
    value: string;
    label: string;
};

type Props = {
    options: PropertyOption[]
    value?: PropertyOption | PropertyOption[]
    emptyValue: string
    onCreate: (value: string) => void
    onChange: (value: string[]) => void
    onChangeColor: (option: PropertyOption, color: string) => void
    onDeleteOption: (option: PropertyOption) => void
    isMulti?: boolean
    onDeleteValue?: (value: string) => void
    onBlur?: () => void
}

type LabelProps = {
    option: PropertyOption
    meta: FormatOptionLabelMeta<PropertyOption>
    onChangeColor: (option: PropertyOption, color: string) => void
    onDeleteOption: (option: PropertyOption) => void
    onDeleteValue?: (value: string) => void
    isMulti?: boolean
}

const ValueSelectorLabel = (props: LabelProps): JSX.Element => {
    const {option, onDeleteValue, meta, isMulti} = props;

    if (meta.context === 'value') {
        return (
            <Label className='Label'>
                <span>{option.value}</span>
                {onDeleteValue &&
                    <IconButton
                        onClick={() => onDeleteValue(option.value)}
                        icon={<CloseIcon/>}
                        title='Clear'
                        className='margin-left delete-value'
                    />
                }
            </Label>
        );
    }
    return (
        <div
            className='value-menu-option'
            role='menuitem'
        >
            <div className='label-container'>
                <Label className='Label'>{option.value}</Label>
            </div>
            <MenuWrapper stopPropagationOnToggle={true}>
                <IconButton
                    title='Open menu'
                    icon={<OptionsIcon/>}
                />
                <Menu position='left'>
                    <Menu.Text
                        id='delete'
                        icon={<DeleteIcon/>}
                        name='Delete'
                        onClick={() => props.onDeleteOption(option)}
                    />
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export function getSelectBaseStyle() {
    return {
        dropdownIndicator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none !important',
        }),
        indicatorSeparator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none',
        }),
        loadingIndicator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none',
        }),
        clearIndicator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none',
        }),
        menu: (provided: CSSObject): CSSObject => ({
            ...provided,
            width: 'unset',
            background: 'rgb(var(--center-channel-bg-rgb))',
        }),
        option: (provided: CSSObject, state: { isFocused: boolean }): CSSObject => ({
            ...provided,
            background: state.isFocused ? 'rgba(var(--center-channel-color-rgb), 0.1)' : 'rgb(var(--center-channel-bg-rgb))',
            color: state.isFocused ? 'rgb(var(--center-channel-color-rgb))' : 'rgb(var(--center-channel-color-rgb))',
            padding: '2px 8px',
        }),
        control: (): CSSObject => ({
            border: 0,
            width: '100%',
            margin: '4px 0 0 0',

            // display: 'flex',
            // marginTop: 0,
        }),
        valueContainer: (provided: CSSObject): CSSObject => ({
            ...provided,
            padding: '0 5px',
            overflow: 'unset',
        }),
        singleValue: (provided: CSSObject): CSSObject => ({
            ...provided,
            color: 'rgb(var(--center-channel-color-rgb))',
            overflow: 'unset',
            maxWidth: 'calc(100% - 20px)',
        }),
        input: (provided: CSSObject): CSSObject => ({
            ...provided,
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            marginTop: 0,
        }),
        menuList: (provided: CSSObject): CSSObject => ({
            ...provided,
            overflowY: 'auto',
            overflowX: 'hidden',
        }),
    };
}

const valueSelectorStyle = {
    ...getSelectBaseStyle(),
    option: (provided: CSSObject, state: {isFocused: boolean}): CSSObject => ({
        ...provided,
        background: state.isFocused ? 'rgba(var(--center-channel-color-rgb), 0.1)' : 'rgb(var(--center-channel-bg-rgb))',
        color: state.isFocused ? 'rgb(var(--center-channel-color-rgb))' : 'rgb(var(--center-channel-color-rgb))',
        padding: '8px',
    }),
    control: (): CSSObject => ({
        border: 0,
        width: '100%',
        margin: '0',
    }),
    valueContainer: (provided: CSSObject): CSSObject => ({
        ...provided,
        padding: '0 8px',
        overflow: 'unset',
    }),
    singleValue: (provided: CSSObject): CSSObject => ({
        ...provided,
        position: 'static',
        top: 'unset',
        transform: 'unset',
    }),
    placeholder: (provided: CSSObject): CSSObject => ({
        ...provided,
        color: 'rgba(var(--center-channel-color-rgb), 0.4)',
    }),
    multiValue: (provided: CSSObject): CSSObject => ({
        ...provided,
        margin: 0,
        padding: 0,
        backgroundColor: 'transparent',
    }),
    multiValueLabel: (provided: CSSObject): CSSObject => ({
        ...provided,
        display: 'flex',
        paddingLeft: 0,
        padding: 0,
    }),
    multiValueRemove: (): CSSObject => ({
        display: 'none',
    }),
    menu: (provided: CSSObject): CSSObject => ({
        ...provided,
        width: 'unset',
        background: 'rgb(var(--center-channel-bg-rgb))',
        minWidth: '260px',
        position: 'fixed',
        top: 'unset',
    }),
};

function ValueSelector(props: Props): JSX.Element {
    return (
        <CreatableSelect
            noOptionsMessage={() => 'No options. Start typing to add the first one!'}
            aria-label='Value selector'
            captureMenuScroll={true}
            maxMenuHeight={1200}
            isMulti={props.isMulti}
            isClearable={true}
            styles={valueSelectorStyle}
            formatOptionLabel={(option: PropertyOption, meta: FormatOptionLabelMeta<PropertyOption>) => (
                <ValueSelectorLabel
                    option={option}
                    meta={meta}
                    isMulti={props.isMulti}
                    onChangeColor={props.onChangeColor}
                    onDeleteOption={props.onDeleteOption}
                    onDeleteValue={props.onDeleteValue}
                />
            )}
            className='ValueSelector'
            classNamePrefix='ValueSelector'
            options={props.options}
            getOptionLabel={(o: PropertyOption) => o.label}
            getOptionValue={(o: PropertyOption) => o.value}
            onChange={(value: OnChangeValue<PropertyOption, true | false>, action: ActionMeta<PropertyOption>): void => {
                if (action.action === 'select-option' || action.action === 'pop-value') {
                    if (Array.isArray(value)) {
                        props.onChange((value as PropertyOption[]).map((option) => option.value));
                    } else {
                        props.onChange([(value as PropertyOption).value]);
                        props.onBlur?.();
                    }
                } else if (action.action === 'clear') {
                    props.onChange([]);
                }
            }}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    props.onBlur?.();
                }
            }}
            onBlur={props.onBlur}
            onCreateOption={props.onCreate}
            autoFocus={true}
            value={props.value || null}
            closeMenuOnSelect={!props.isMulti}
            placeholder={props.emptyValue}
            hideSelectedOptions={false}
            defaultMenuIsOpen={true}
            menuIsOpen={props.isMulti}
            blurInputOnSelect={!props.isMulti}
        />
    );
}

export default React.memo(ValueSelector);
