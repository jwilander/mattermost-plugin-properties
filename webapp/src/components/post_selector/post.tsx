// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import styled from 'styled-components';

import {GlobalState} from '@mattermost/types/store';
import {Post as PostType} from '@mattermost/types/posts';
import {UserProfile} from '@mattermost/types/users';
import {Channel} from '@mattermost/types/channels';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser as fetchUser} from 'mattermost-redux/actions/users';
import {getPost as fetchPost} from 'mattermost-redux/actions/posts';
import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {ProfileName} from 'src/components/user_selector/profile';

interface Props {
    postID: string;
    userID: string;
    channelID: string;
    classNames?: Record<string, boolean>;
    className?: string;
}

const PostContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 5px;
`;

export const ChannelText = styled.div`
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 18px;
    display: flex;
    align-items: center;
`;

export const PostText = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
    max-width: 300px;
    padding-left: 3px;
    min-height: 18px;
    align-items: center;
    display: flex;
`;

const Post = ({postID, userID, channelID, ...props}: Props) => {
    const dispatch = useDispatch();
    const post = useSelector<GlobalState, PostType>((state) => getPost(state, postID));
    const user = useSelector<GlobalState, UserProfile>((state) => getUser(state, userID));
    const channel = useSelector<GlobalState, Channel>((state) => getChannel(state, channelID));
    const teamnameNameDisplaySetting = useSelector<GlobalState, string | undefined>(getTeammateNameDisplaySetting) || '';

    useEffect(() => {
        if (!post) {
            dispatch(fetchPost(postID));
        }
        if (!user) {
            dispatch(fetchUser(userID));
        }
        if (!channel) {
            dispatch(fetchChannel(channelID));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postID, userID, channelID]);

    let name = null;
    if (user) {
        const preferredName = displayUsername(user, teamnameNameDisplaySetting);
        name = preferredName;
    }

    return (
        <PostContainer
            className={classNames('PostOption', props.classNames, props.className)}
            data-testid={`post-option-${postID}`}
        >
            <ProfileName className='PostName'>
                {name}
            </ProfileName>
            <ChannelText className='ChannelText'>
                {`in ~${channel.display_name}:`}
            </ChannelText>
            <PostText className='PostText'>
                {`"${post.message}"`}
            </PostText>
        </PostContainer>
    );
};

export default Post;
