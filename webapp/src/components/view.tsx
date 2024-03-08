// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import styled from 'styled-components';

import {fetchObjectsForView} from 'src/client';

const ViewContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;

type ViewProps = {
    id: string;
}

const View = ({id}: ViewProps) => {
    useEffect(() => {
        if (!id) {
            return;
        }
        fetchObjectsForView(id);
    });

    // @ts-ignore
    /*const PostList = window.Components.PostList;

    if (!PostList) {
        // eslint-disable-next-line no-console
        console.error('unable to mount PostList component');

        return null;
    }*/

    return (
        <ViewContainer>
            {`View ID: ${id}`}
        </ViewContainer>
    );
};

export default View;
