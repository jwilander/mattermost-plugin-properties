// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';

import {generateClassName} from 'src/utils';

type Props = {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    title?: string
    icon?: React.ReactNode
    className?: string
    size?: string
    inverted?: boolean
    onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button = styled.button`
    cursor: pointer;
    border-radius: 4px;
    flex: 0 0 24px;
    height: 24px;
    width: 24px;
    padding: 0;
    margin: 0;
    background: transparent;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 100ms ease-out 0s;
    color: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        color: rgba(var(--center-channel-color-rgb), 0.72);
        background-color: rgba(var(--center-channel-color-rgb), 0.08);
    }

    &:active {
        background-color: rgba(var(--button-bg-rgb), 0.08);
        color: rgba(var(--button-bg-rgb), 1);
    }

    &.style--inverted {
        color: rgba(var(--sidebar-text-rgb), 0.64);

        &:hover {
            color: rgba(var(--sidebar-text-rgb), 1);
            background-color: rgba(var(--sidebar-text-rgb), 0.08);
        }

        &:active {
            color: rgba(var(--sidebar-text-rgb), 1);
            background-color: rgba(var(--sidebar-text-rgb), 0.16);
        }
    }

    .Icon {
        height: 24px;
        width: 24px;
        padding: 0;
        margin: 0;
    }

    &.size--large {
        flex: 0 0 48px;
        width: 48px;
        height: 48px;
        font-size: 31.2px;
    }

    &.size--medium {
        flex: 0 0 40px;
        width: 40px;
        height: 40px;
        font-size: 24px;
    }

    &.size--small {
        flex: 0 0 32px;
        width: 32px;
        height: 32px;
        font-size: 18px;
    }

    &.margin-left {
        margin-left: 5px;
    }
`;

function IconButton(props: Props): JSX.Element {
    const classNames: Record<string, boolean> = {
        IconButton: true,
        'style--inverted': Boolean(props.inverted),
    };
    classNames[`${props.className}`] = Boolean(props.className);
    classNames[`size--${props.size}`] = Boolean(props.size);

    return (
        <Button
            type='button'
            onClick={props.onClick}
            onMouseDown={props.onMouseDown}
            className={generateClassName(classNames)}
            title={props.title}
            aria-label={props.title}
        >
            {props.icon}
        </Button>
    );
}

export default React.memo(IconButton);
