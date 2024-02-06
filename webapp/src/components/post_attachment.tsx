// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled, {css} from 'styled-components';
import {GlobalState} from '@mattermost/types/store';

import {fetchPropertiesForObject} from 'src/client';
import {receivedPropertiesForObject} from '@/actions';

const IconButtonWrapper = styled.div<{toggled: boolean}>`
    position: relative;
    display: flex;
    border-radius: 5px;
    padding: 4px;
    cursor: pointer;
`;

type PostAttachmentProps = {
    postId: string;
}

const PostAttachment = ({postId}: PostAttachmentProps) => {
    const dispatch = useDispatch();

    useEffect(() => {
        fetchPropertiesForObject(postId).
            then((res) => dispatch(receivedPropertiesForObject(postId, res.items || [])));
    }, [currentUserId]);

    return (
        <>

        </>
    );
};

export default PostAttachment;
