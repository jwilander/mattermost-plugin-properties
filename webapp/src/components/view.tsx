// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

import {Post as PostType} from '@mattermost/types/lib/posts';

import {fetchObjectsForView} from 'src/client';
import Post from 'src/components/post';
import {ViewQuery} from '@/types/property';

const ViewContainer = styled.div`
    padding: 50px;
`;

type ViewProps = {
    id: string;
    title: string;
    query: ViewQuery;
}

const queryToString = (query: ViewQuery) => {
    const str = '';

    //Object.keys(query.fields).forEach(())
    return str;
};

const View = ({id, title, query}: ViewProps) => {
    const [posts, setPosts] = useState([] as PostType[]);

    useEffect(() => {
        getPostIdsForView(id);
    }, [id]);

    async function getPostIdsForView(viewID: string) {
        if (!viewID) {
            return;
        }
        const results = await fetchObjectsForView(viewID);
        setPosts(results.posts);
    }

    return (
        <ViewContainer>
            <Title>{title}</Title>
            <Query>{'test'}</Query>
            <ObjectList>
                {posts.map((p) => (
                    <Post
                        key={`post-${id}-${p.id}`}
                        id={p.id}
                        create_at={p.create_at}
                        userID={p.user_id}
                        message={p.message}
                    />
                ))}
            </ObjectList>
        </ViewContainer>
    );
};

const Title = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: var(--center-channel-color);
`;

const Query = styled.span`
    font-size: 12px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    padding-bottom: 20px;
`;

const ObjectList = styled.div`
    margin-top: 20px;
`;

export default View;
