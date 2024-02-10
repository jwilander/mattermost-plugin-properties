// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC} from 'react';
import styled from 'styled-components';

const MenuSeparator = styled.div`
    border-bottom: solid 1px rgba(var(--center-channel-color-rgb), 0.16);
    margin: 8px 0;
`;

const SeparatorOption: FC = (): JSX.Element => (
    <MenuSeparator className='MenuOption menu-separator'/>
);

export default SeparatorOption;
