// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useSelector, useDispatch, batch} from 'react-redux';
import {IntlProvider} from 'react-intl';
import styled from 'styled-components';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import {Post as PostType} from '@mattermost/types/lib/posts';

import {fetchObjectsForView} from 'src/client';
import {ObjectWithoutProperties} from 'src/types/property';
import {getObjectsWithPropertiesForView, getPropertyFields, getView} from 'src/selectors';

import List from 'src/components/list';
import Kanban from 'src/components/kanban';
import {receivedObjectsForView, receivedPropertiesForObject} from '@/actions';
import {ReceivedPropertiesForObject} from '@/types/actions';

import GroupBy from './group_by';

const ViewContainer = styled.div`
    padding: 50px;
    height: 100%;
`;

type ViewProps = {
    id: string;
}

const View = ({id}: ViewProps) => {
    const dispatch = useDispatch();
    const view = useSelector(getView(id));
    const {title, type, format, query} = view;
    const [posts, setPosts] = useState([] as PostType[]);
    const fields = useSelector(getPropertyFields);
    const objects = useSelector(getObjectsWithPropertiesForView(id));

    useEffect(() => {
        getPostsForView(id);
    }, [id]);

    async function getPostsForView(viewID: string) {
        if (!viewID) {
            return;
        }
        const results = await fetchObjectsForView(viewID);
        setPosts(results.posts);
        const objectsWithoutProperties = results.posts.map((p) => ({id: p.id, type: 'post', content: p.message} as ObjectWithoutProperties));

        const actions = [] as ReceivedPropertiesForObject[];
        Object.keys(results.properties).forEach((objectID) => {
            actions.push(receivedPropertiesForObject(objectID, results.properties[objectID]));
        });

        batch(() => {
            actions.forEach((a) => dispatch(a));
            dispatch(receivedObjectsForView(id, objectsWithoutProperties));
        });
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
        <IntlProvider locale='en'>
            <DndProvider backend={HTML5Backend}>
                <ViewContainer>
                    <Header>
                        <HeaderTitle>
                            <Title>
                                {title}
                            </Title>
                            <Query>{queryToString()}</Query>
                        </HeaderTitle>
                        <HeaderRight>
                            {type === 'kanban' ? (
                                <GroupBy
                                    view={view}
                                />
                            ) : null
                            }
                        </HeaderRight>
                    </Header>
                    <ObjectContainer>
                        {type === 'list' ? (
                            <List
                                id={id}
                                posts={posts}
                            />
                        ) : (
                            <Kanban
                                id={id}
                                objects={objects}
                                format={format}
                            />
                        )}
                    </ObjectContainer>
                </ViewContainer>
            </DndProvider>
        </IntlProvider>
    );
};

const Header = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const HeaderTitle = styled.div`
`;

const HeaderRight = styled.div`
`;

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
    height: 100%;
`;

export default View;
