// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import {ControlProps, StylesConfig} from 'react-select';
import AsyncSelect from 'react-select/async';
import {Placement} from '@floating-ui/react-dom-interactions';
import {useUpdateEffect} from 'react-use';
import styled, {css} from 'styled-components';

import {Post} from '@mattermost/types/posts';

import {getPost} from 'mattermost-redux/actions/posts';

import Dropdown from 'src/components/dropdown';

import PostComponent from './post';
import PostButton from './post_button';

type ActionTypes = | 'clear' | 'create-option' | 'deselect-option' | 'pop-value' | 'remove-value' | 'select-option' | 'set-value';

export interface Option {
    value: string;
    label: JSX.Element | string;
    post: Post;
}

interface ActionObj {
    action: ActionTypes;
}

interface Props {
    testId?: string
    selectedPostID?: string;
    selectedUserID?: string;
    selectedChannelID?: string;
    excludedPostID?: string;
    placeholder: React.ReactNode;
    placeholderButtonClass?: string;
    postButtonClass?: string;
    onlyPlaceholder?: boolean;
    enableEdit: boolean;
    onEditDisabledClick?: () => void
    isClearable?: boolean;
    customControl?: (props: ControlProps<Option, boolean>) => React.ReactElement;
    controlledOpenToggle?: boolean;
    defaultValue?: string;
    onSelectedChange?: (post?: Post) => void;
    customControlProps?: any;
    placement?: Placement;
    className?: string;
    customDropdownArrow?: React.ReactNode;
    onOpenChange?: (isOpen: boolean) => void;
    getAllPosts: () => Promise<Post[]>;
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
    height: 4rem;

    :hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
    }

    :active {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
    }

    .icon-chevron-down {
        :before {
            margin: 0;
        }
    }

    ${(props) => props.active && css`
        cursor: pointer;
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
    `}
`;

const postToOption = (post: Post) => {
    return {
        value: post.id,
        label: (
            <PostComponent
                postID={post.id}
                userID={post.user_id}
                channelID={post.channel_id}
            />
        ),
        post,
    } as Option;
};

export default function PostSelector({selectedPostID, controlledOpenToggle, onOpenChange, getAllPosts, ...props}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const [isOpen, setOpen] = useState(false);
    const toggleOpen = () => {
        if (!isOpen) {
            fetchPosts();
        }
        setOpen(!isOpen);
    };

    useUpdateEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen]);

    // Allow the parent component to control the open state -- only after mounting.
    const [oldOpenToggle, setOldOpenToggle] = useState(controlledOpenToggle);
    useEffect(() => {
        if (controlledOpenToggle !== undefined && controlledOpenToggle !== oldOpenToggle) {
            setOpen(!isOpen);
            setOldOpenToggle(controlledOpenToggle);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledOpenToggle]);

    const [postOptions, setPostOptions] = useState<Option[]>([]);

    async function fetchPosts() {
        const posts = await getAllPosts();

        const filteredPosts = posts.filter((p) => {
            if (props.excludedPostID && p.id === props.excludedPostID) {
                return false;
            }
            if (p.type && p.type.lastIndexOf('system_') === 0) {
                return false;
            }
            return true;
        });
        setPostOptions(filteredPosts.map((p) => postToOption(p)));
    }

    // Fill in the userOptions on mount.
    useEffect(() => {
        fetchPosts();
    }, []);

    const [selected, setSelected] = useState<Option | null>(null);

    // Whenever the selectedPostID changes we have to set the selected, but we can only do this once we
    // have postOptions
    useEffect(() => {
        if (postOptions.length === 0) {
            return;
        }
        const post = postOptions.find((option: Option) => option.post.id === selectedPostID);
        if (post) {
            setSelected(post);
        } else {
            setSelected(null);
        }
    }, [postOptions, selectedPostID]);

    const onSelectedChange = async (value: Option | undefined, action: ActionObj) => {
        if (action.action === 'clear') {
            return;
        }
        toggleOpen();
        if (value?.post.id === selected?.post.id) {
            return;
        }
        if (props.onSelectedChange) {
            props.onSelectedChange(value?.post);
        }
    };

    const dropdownArrow = props.customDropdownArrow ? props.customDropdownArrow : (
        <i className={'icon-chevron-down icon--small ml-2'}/>
    );

    let target;
    if (selectedPostID && props.selectedUserID && props.selectedChannelID) {
        target = (
            <PostButton
                enableEdit={props.enableEdit}
                postID={selectedPostID}
                userID={props.selectedUserID}
                channelID={props.selectedChannelID}
                postButtonClass={props.postButtonClass}
                onClick={props.enableEdit ? toggleOpen : () => null}
            />
        );
    } else if (props.placeholderButtonClass) {
        target = (
            <button
                onClick={() => {
                    if (props.enableEdit) {
                        toggleOpen();
                    }
                }}
                disabled={!props.enableEdit}
                className={props.placeholderButtonClass}
            >
                {props.placeholder}
                {dropdownArrow}
            </button>
        );
    } else {
        target = (
            <FilterButton
                active={isOpen}
                onClick={() => {
                    if (props.enableEdit) {
                        toggleOpen();
                    }
                }}
            >
                {selected === null ? props.placeholder : selected.label}
                {dropdownArrow}
            </FilterButton>
        );
    }

    if (props.onlyPlaceholder) {
        target = (
            <div>
                {props.placeholder}
            </div>
        );
    }
    const targetWrapped = (
        <div
            data-testid={props.testId}
            onClick={props.enableEdit ? toggleOpen : props.onEditDisabledClick}
            className={props.className}
        >
            {target}
        </div>
    );

    const noDropdown = {DropdownIndicator: null, IndicatorSeparator: null};
    const components = props.customControl ? {
        ...noDropdown,
        Control: props.customControl,
    } : noDropdown;

    const loadOptions = async (inputValue: string, callback: (options: Option[]) => void) => {
        if (inputValue.length !== 26) {
            return;
        }
        const {data: searchedPost} = await dispatch(getPost(inputValue));
        if (searchedPost) {
            callback([postToOption(searchedPost)]);
        }
    };

    return (
        <Dropdown
            target={targetWrapped}
            placement={props.placement}
            isOpen={isOpen}
            onOpenChange={setOpen}
        >
            <AsyncSelect
                autoFocus={true}
                backspaceRemovesValue={false}
                components={components}
                controlShouldRenderValue={false}
                hideSelectedOptions={false}
                isClearable={props.isClearable}
                menuIsOpen={true}
                loadOptions={loadOptions}
                defaultOptions={postOptions}
                placeholder={formatMessage({id: 'enter_post_id', defaultMessage: 'Enter Post ID'})}
                styles={selectStyles}
                tabSelectsValue={false}
                value={selected}
                onChange={(option, action) => onSelectedChange(option as Option, action as ActionObj)}
                classNamePrefix='properties-react-select'
                className='properties-react-select'
                {...props.customControlProps}
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
