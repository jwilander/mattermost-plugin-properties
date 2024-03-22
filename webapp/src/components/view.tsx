// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {Post as PostType} from '@mattermost/types/lib/posts';

import {fetchObjectsForView} from 'src/client';
import {ViewQuery, ViewTypeEnum} from 'src/types/property';
import {getPropertyFields} from 'src/selectors';

import List from 'src/components/list';
import Kanban from 'src/components/kanban';

const ViewContainer = styled.div`
    padding: 50px;
`;

type ViewProps = {
    id: string;
    title: string;
    type: ViewTypeEnum;
    query: ViewQuery;
}

const View = ({id, title, type, query}: ViewProps) => {
    const [posts, setPosts] = useState([] as PostType[]);
    const fields = useSelector(getPropertyFields);

    useEffect(() => {
        getPostsForView(id);
    }, [id]);

    async function getPostsForView(viewID: string) {
        if (!viewID) {
            return;
        }
        const results = await fetchObjectsForView(viewID);
        setPosts(results.posts);
    }

    const queryToString = useCallback(() => {
        let lines = [] as string[];
        if (query.channel_id) {
            lines.push(`Channel ID = '${query.channel_id}'`);
        }
        if (query.team_id) {
            lines.push(`Team ID = '${query.team_id}'`);
        }
        if (query.includes) {
            lines = lines.concat(Object.keys(query.includes).map((fid) => `${fields[fid] ? fields[fid].name : 'unknown'} includes ${query.includes[fid].length ? query.includes[fid] : 'any'}`));
        }
        if (query.excludes) {
            lines = lines.concat(Object.keys(query.excludes).map((fid) => `${fields[fid] ? fields[fid].name : 'unknown'} excludes ${query.excludes[fid].length ? query.excludes[fid] : 'any'}`));
        }
        return lines.join(' && ');
    }, [query, fields]);

    return (
        <ViewContainer>
            <Title>{title}</Title>
            <Query>{queryToString()}</Query>
            <ObjectContainer>
                {type === 'list' ? (
                    <List
                        id={id}
                        posts={posts}
                    />
                ) : (
                    <Kanban
                        id={id}
                        posts={posts}
                    />
                )}
            </ObjectContainer>
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

const ObjectContainer = styled.div`
    margin-top: 20px;
`;

export default View;
