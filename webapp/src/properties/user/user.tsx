// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import styled, {css} from 'styled-components';
import {ControlProps, components} from 'react-select';

import {UserProfile} from '@mattermost/types/users';

import UserSelector from 'src/components/user_selector';
import {useProfilesInTeam} from 'src/hooks';
import {PropertyProps} from 'src/properties/types';

const StyledUserSelector = styled(UserSelector)`
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
                    id='no_user'
                    defaultMessage='None'
                />
            </ControlComponentAnchor>
        )}
    </div>
);

const UserProperty = (props: PropertyProps) => {
    const {value, readOnly, onChange} = props;

    const {formatMessage} = useIntl();
    const profilesInTeam = useProfilesInTeam();
    const [profileSelectorToggle, setProfileSelectorToggle] = useState(false);

    const onSelectedChange = useCallback((user?: UserProfile) => onChange(user?.id ? [user.id] : []), [onChange]);

    const resetAssignee = useCallback(() => {
        onChange([]);
        setProfileSelectorToggle(!profileSelectorToggle);
    }, [onChange]);

    const selectedUserId = value.length > 0 ? value[0] : undefined;

    const dropdownArrow = (
        <DropdownArrow className='icon-chevron-down icon--small ml-1'/>
    );

    return (
        <StyledUserSelector
            testId='assignee-profile-selector'
            selectedUserId={selectedUserId}
            placeholder={
                <PlaceholderDiv>
                    <AssignToTextContainer
                        isPlaceholder={!selectedUserId}
                        enableEdit={!readOnly}
                    >
                        {formatMessage({id: 'no_user', defaultMessage: 'None'})}
                    </AssignToTextContainer>
                </PlaceholderDiv>
            }
            placeholderButtonClass='NoAssignee-button'
            profileButtonClass='Assigned-button'
            enableEdit={!readOnly}
            getAllUsers={async () => {
                return profilesInTeam;
            }}
            onSelectedChange={onSelectedChange}
            selfIsFirstOption={true}
            customControl={ControlComponent}
            customControlProps={{
                showCustomReset: Boolean(selectedUserId),
                onCustomReset: resetAssignee,
            }}
            customDropdownArrow={<></>}
            placement='bottom-start'
        />
    );
};

export default React.memo(UserProperty);
