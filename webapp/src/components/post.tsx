// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {useSelector} from 'react-redux';

import {GlobalState} from '@mattermost/types/lib/store';
import {UserProfile} from '@mattermost/types/lib/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {Timestamp, formatText, messageHtmlToComponent} from 'src/webapp_globals';
import {useEnsureProfile} from 'src/hooks';
import PostAttachment from 'src/components/post_attachment';

type PostProps = {
    id: string;
    create_at: number;
    message: string;
    userID: string;
}

const REL_UNITS = [
    'Today',
    'Yesterday',
];

function useAuthorInfo(userID: string) : [string, string] {
    const teamnameNameDisplaySetting = useSelector<GlobalState, string | undefined>(getTeammateNameDisplaySetting) || '';
    const user = useSelector<GlobalState, UserProfile>((state) => getUser(state, userID));
    useEnsureProfile(user.username);

    let profileUrl = '';
    let preferredName = '';
    if (user) {
        profileUrl = Client4.getProfilePictureUrl(user.id, user.last_picture_update);
        preferredName = displayUsername(user, teamnameNameDisplaySetting);
    }

    return [profileUrl, preferredName];
}

const Post = ({id, create_at, message, userID}: PostProps) => {
    const [authorProfileUrl, authorUserName] = useAuthorInfo(userID);
    const markdownOptions = {
        singleline: false,
        mentionHighlight: true,
        atMentions: true,
    };

    const messageHtmlToComponentOptions = {
        hasPluginTooltips: true,
    };

    return (
        <Container key={`post-${id}`}>
            <Header>
                <ProfilePic src={authorProfileUrl}/>
                <Author>{authorUserName}</Author>
                <Date>
                    <Timestamp
                        value={create_at}
                        units={REL_UNITS}
                    />
                </Date>
            </Header>
            <Body>
                {messageHtmlToComponent(formatText(message, markdownOptions), true, messageHtmlToComponentOptions)}
            </Body>
            <PostAttachment postId={id}/>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 8px;
`;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
    align-items: center;
`;

const ProfilePic = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 50%;
`;
const Author = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: var(--center-channel-color);
    margin-right: 6px;
`;

const Date = styled.span`
    font-size: 12px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const Body = styled.div`
    color: var(--center-channel-color);
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
`;

export default Post;
