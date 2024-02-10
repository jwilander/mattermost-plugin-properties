// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled, {css} from 'styled-components';

const Label = styled.span<{empty: boolean}>`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    margin: 4px 4px 0 0;
    border-radius: 3px;
    line-height: 20px;
    color: rgba(var(--center-channel-color-rgb), 0.8);
    white-space: nowrap;
    text-transform: uppercase;
    overflow: hidden;
    font-weight: 600;
    font-size: 13px;
    max-width: 100%;

    ${(props) => props.empty && css`
        color: rgba(var(--center-channel-color-rgb), 0.4);
        padding: 1px;
        text-transform: none;
        font-weight: normal;
    `};
`;

export default Label;
