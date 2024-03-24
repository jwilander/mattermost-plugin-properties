// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState, memo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled, {css} from 'styled-components';
import {ControlProps, components} from 'react-select';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {GlobalState} from '@mattermost/types/store';
import {Post} from '@mattermost/types/posts';

import PostSelector from 'src/components/post_selector';
import {usePostsInChannel} from 'src/hooks';
import {PropertyProps} from 'src/properties/types';

const StyledPostSelector = styled(PostSelector)`
    .Assigned-button, .NoAssignee-button, .NoName-Assigned-button {
        display: flex;
        align-items: center;
        max-width: 100%;
        height: 24px;
        padding: 2px 6px 2px 2px;
        margin-top: 0;
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: var(--center-channel-color);
        border-radius: 100px;
        border: none;

        font-weight: 400;
        font-size: 12px;
        line-height: 10px;

        ${({enableEdit}) => enableEdit && css`
            :hover {
                background: rgba(var(--center-channel-color-rgb), 0.16);
            }
        `}

        .image {
            width: 20px;
            height: 20px;
        }

        .icon-chevron-down{
            font-weight: 400;
            font-size: 14.4px;
            line-height: 14px;
            display: flex;
            align-items: center;
            text-align: center;
        }
    }

    .NoName-Assigned-button {
        padding: 0 6px 0 0;

        .image {
            background: rgba(var(--center-channel-color-rgb),0.08);
            margin: 2px;
        }
    }

    .NoAssignee-button {
        background-color: transparent;
        border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.64);

        ${({enableEdit}) => enableEdit && css`
            :hover {
                color: var(--center-channel-color);
            }
        `}
    }
`;

const PlaceholderDiv = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 4px 0;
`;

const AssignToTextContainer = styled.div<{isPlaceholder: boolean, enableEdit: boolean}>`
    color: ${({isPlaceholder}) => (isPlaceholder ? 'rgba(var(--center-channel-color-rgb), 0.64)' : 'var(--center-channel-color)')};

     ${({enableEdit}) => enableEdit && css`
        :hover {
            color: var(--center-channel-color);
        }
    `}
    font-weight: 400;
    font-size: 12px;
    line-height: 15px;
`;

export const AssignToContainer = styled.div`
    display: flex;
`;

const ControlComponentAnchor = styled.a`
    display: inline-block;
    margin: 0 0 8px 12px;
    font-weight: 600;
    font-size: 12px;
    position: relative;
    top: -4px;
`;

export const DropdownArrow = styled.i`
    color: var(--center-channel-color-32);
`;

const ControlComponent = (ownProps: ControlProps<Option, boolean>) => (
    <div>
        <components.Control {...ownProps}/>
        {ownProps.selectProps.showCustomReset && (
            <ControlComponentAnchor onClick={ownProps.selectProps.onCustomReset}>
                <FormattedMessage
                    id='no_post'
                    defaultMessage='None'
                />
            </ControlComponentAnchor>
        )}
    </div>
);

const PostProperty = ({value, readOnly, onChange, objectID, objectType}: PropertyProps) => {
    // eslint-disable-next-line no-undefined
    const selectedPostID = value.length > 0 ? value[0] : undefined;

    const {formatMessage} = useIntl();
    const postsInChannel = usePostsInChannel();
    const [postSelectorToggle, setPostSelectorToggle] = useState(false);
    const post = useSelector((state: GlobalState) => getPost(state, selectedPostID));

    const onSelectedChange = useCallback((newPost?: Post) => onChange(newPost?.id ? [newPost.id] : []), [onChange]);

    const resetSelected = useCallback(() => {
        onChange([]);
        setPostSelectorToggle(!postSelectorToggle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onChange]);

    return (
        <StyledPostSelector
            testId='post-selector'
            selectedPostID={selectedPostID}
            selectedUserID={post?.user_id}
            selectedChannelID={post?.channel_id}
            excludedPostID={objectType === 'post' ? objectID : undefined}
            placeholder={
                <PlaceholderDiv>
                    <AssignToTextContainer
                        isPlaceholder={!selectedPostID}
                        enableEdit={!readOnly}
                    >
                        {formatMessage({id: 'no_post', defaultMessage: 'None'})}
                    </AssignToTextContainer>
                </PlaceholderDiv>
            }
            placeholderButtonClass='NoAssignee-button'
            postButtonClass='Assigned-button'
            enableEdit={!readOnly}
            getAllPosts={async () => {
                return postsInChannel;
            }}
            onSelectedChange={onSelectedChange}
            selfIsFirstOption={false}
            customControl={ControlComponent}
            customControlProps={{
                showCustomReset: Boolean(selectedPostID),
                onCustomReset: resetSelected,
            }}
            customDropdownArrow={<></>}
            placement='bottom-start'
        />
    );
};

export default memo(PostProperty);
