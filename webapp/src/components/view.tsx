// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

const ViewContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;

type ViewProps = {
}

const View = ({}: ViewProps) => {
    return (
        <ViewContainer>
            {'Test'}
        </ViewContainer>
    );
};

export default View;
