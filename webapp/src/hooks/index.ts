// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createSelector} from 'reselect';

import {GlobalState} from '@mattermost/types/store';
import {Channel} from '@mattermost/types/channels';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getAllPosts, getPostIdsInChannel} from 'mattermost-redux/selectors/entities/posts';
import {getProfilesInCurrentTeam, getUser} from 'mattermost-redux/selectors/entities/users';
import {getProfilesByIds, getProfilesInTeam} from 'mattermost-redux/actions/users';
import {getPosts} from 'mattermost-redux/actions/posts';
import {UserProfile} from 'mattermost-redux/types/users';

const PROFILE_CHUNK_SIZE = 200;
const POST_CHUNK_SIZE = 60;

// useProfilesInTeam ensures at least the first page of team members has been loaded into Redux.
//
// This pattern relieves components from having to issue their own directives to populate the
// Redux cache when rendering in contexts where the webapp doesn't already do this itself.
//
// Since we never discard Redux metadata, this hook will fetch successfully at most once. If there
// are already members in the team, the hook skips the fetch altogether. If the fetch fails, the
// hook won't try again unless the containing component is re-mounted.
//
// A global lockProfilesInTeamFetch cache avoids the thundering herd problem of many components
// wanting the same metadata.
export function useProfilesInTeam() {
    const dispatch = useDispatch();
    const profilesInTeam = useSelector(getProfilesInCurrentTeam);
    const currentTeamId = useSelector(getCurrentTeamId);

    useEffect(() => {
        if (profilesInTeam.length > 0) {
            // As soon as we successfully fetch a team's profiles, clear the bit that prevents
            // concurrent fetches. We won't try again since we shouldn't forget these profiles,
            // but we also don't want to unexpectedly block this forever.
            lockProfilesInTeamFetch.delete(currentTeamId);
            return;
        }

        // Avoid issuing multiple concurrent fetches for this team.
        if (lockProfilesInTeamFetch.has(currentTeamId)) {
            return;
        }
        lockProfilesInTeamFetch.add(currentTeamId);

        dispatch(getProfilesInTeam(currentTeamId, 0, PROFILE_CHUNK_SIZE));
    }, [dispatch, currentTeamId, profilesInTeam]);

    return profilesInTeam;
}

// lockProfilesInTeamFetch, lockProfilesInChannelFetch and lockPostsInChannelFetch prevent concurrently fetching profiles/posts
// from multiple components mounted at the same time, only to all fetch the same data.
//
// Ideally, we would offload this to a Redux saga in the webapp and simply dispatch a
// FETCH_PROFILES_IN_TEAM that handles all this complexity itself.
const lockProfilesInTeamFetch = new Set<string>();
const lockProfilesInChannelFetch = new Set<string>();
const lockPostsInChannelFetch = new Set<string>();

// clearLocks is exclusively for testing.
export function clearLocks() {
    lockProfilesInTeamFetch.clear();
    lockProfilesInChannelFetch.clear();
}

type StringToUserProfileFn = (id: string) => UserProfile;

export function useEnsureProfile(userId: string) {
    const userIds = useMemo(() => [userId], [userId]);
    useEnsureProfiles(userIds);
}

export function useEnsureProfiles(userIds: string[]) {
    const dispatch = useDispatch();
    const getUserFromStore = useSelector<GlobalState, StringToUserProfileFn>(
        (state) => (id: string) => getUser(state, id),
    );

    useEffect(() => {
        const unknownIds = userIds.filter((userId) => !getUserFromStore(userId));
        if (unknownIds.length > 0) {
            dispatch(getProfilesByIds(unknownIds));
        }
    }, [userIds]);
}

const makeGetPostsInChannel = (channelID: string) => {
    return createSelector(
        getAllPosts,
        (state) => getPostIdsInChannel(state, channelID) || [],
        (allPosts, postIDs) => postIDs.map((id) => allPosts[id]),
    );
};

// usePostsInChannel ensures at least the first page of posts in the channel has been loaded into Redux.
//
// This pattern relieves components from having to issue their own directives to populate the
// Redux cache when rendering in contexts where the webapp doesn't already do this itself.
//
// Since we never discard Redux metadata, this hook will fetch successfully at most once per channel. If there
// are posts in the channel, the hook skips the fetch altogether. If the fetch fails, the
// hook won't try again unless the containing component is re-mounted.
//
// A global lockPostsInChannelFetch cache avoids the thundering herd problem of many components
// wanting the same metadata.

const postSelectors: Record<Channel['id'], ReturnType<typeof makeGetPostsInChannel>> = {};

export function usePostsInChannel() {
    const dispatch = useDispatch();
    const currentChannelId = useSelector(getCurrentChannelId);
    let postSelector = postSelectors[currentChannelId];
    if (postSelector == null) {
        postSelector = makeGetPostsInChannel(currentChannelId);
        postSelectors[currentChannelId] = postSelector;
    }
    const postsInChannel = useSelector(postSelector);

    useEffect(() => {
        if (postsInChannel.length > 0) {
            // As soon as we successfully fetch a channel's posts, clear the bit that prevents
            // concurrent fetches. We won't try again since we shouldn't forget these posts,
            // but we also don't want to unexpectedly block this forever.
            lockPostsInChannelFetch.delete(currentChannelId);
            return;
        }

        // Avoid issuing multiple concurrent fetches for this channel.
        if (lockPostsInChannelFetch.has(currentChannelId)) {
            return;
        }
        lockPostsInChannelFetch.add(currentChannelId);

        dispatch(getPosts(currentChannelId, 0, POST_CHUNK_SIZE, false));
    }, [currentChannelId]);

    return postsInChannel;
}
