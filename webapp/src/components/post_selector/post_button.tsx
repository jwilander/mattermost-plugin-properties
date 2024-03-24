// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import Post from './post';

interface Props {
    postID?: string;
    userID?: string;
    channelID?: string;
    enableEdit: boolean;
    postButtonClass?: string;
    onClick: () => void;
}

export default function ProfileButton(props: Props) {
    return (
        <Button
            onClick={props.onClick}
            className={props.postButtonClass || 'PostButton'}
        >
            <Post
                postID={props.postID || ''}
                userID={props.userID || ''}
                channelID={props.channelID || ''}
                classNames={{active: props.enableEdit}}
            />
        </Button>
    );
}

const Button = styled.button`
    font-weight: 600;
    height: 40px;
    padding: 0 4px 0 12px;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);

    -webkit-transition: all 0.15s ease;
    -webkit-transition-delay: 0s;
    -moz-transition: all 0.15s ease;
    -o-transition: all 0.15s ease;
    transition: all 0.15s ease;

    border: none;
    background-color: unset;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
    }

    cursor: default;
    &.active {
        cursor: pointer;
    }

    .PostOption {
        &.active {
            cursor: pointer;
            color: var(--center-channel-color);
        }
    }

    .NoAssignee-button, .Assigned-button {
        background-color: transparent;
        border: none;
        padding: 4px;
        margin-top: 4px;
        border-radius: 100px;
        color: rgba(var(--center-channel-color-rgb), 0.64);
        cursor: pointer;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;

        -webkit-transition: all 0.15s ease;
        -moz-transition: all 0.15s ease;
        -o-transition: all 0.15s ease;
        transition: all 0.15s ease;

        &:hover {
            background: rgba(var(--center-channel-color-rgb), 0.08);
            color: rgba(var(--center-channel-color-rgb), 0.72);
        }

        &.active {
            cursor: pointer;
        }

        .icon-chevron-down {
            &:before {
                margin: 0;
            }
        }
    }

    .first-container .Assigned-button {
        margin-top: 0;
        padding: 2px 0;
        font-size: 14px;
        line-height: 20px;
        color: var(--center-channel-color);
    }
`;
