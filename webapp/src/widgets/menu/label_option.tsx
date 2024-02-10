// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';

type LabelOptionProps = {
    icon?: string
    children: React.ReactNode
}
const MenuContents = styled.div`
    cursor: auto;
    pointer-events: none;
`;

function LabelOption(props: LabelOptionProps): JSX.Element {
    return (
        <MenuContents className='MenuOption LabelOption menu-option'>
            {props.icon ?? <div className='noicon'/>}
            <div className='menu-name'>{props.children}</div>
            <div className='noicon'/>
        </MenuContents>
    );
}

export default React.memo(LabelOption);
