// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import {GlobalState} from '@mattermost/types/store';

import {fetchPropertiesForObject} from 'src/client';
import {receivedPropertiesForObject} from 'src/actions';
import {getPropertiesForObject} from 'src/selectors';

import {Property} from 'src/types/property';

import PropertyElement from './property';

const PropertyContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;

const PropertyBlock = styled.div`
    padding: 5px 6px;
    background: rgba(var(--center-channel-color-rgb), 0.08);
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .ValueSelector {
        padding: 4px 0;
        background-color: rgba(var(--center-channel-color-rgb), 0.08);
        width: auto;
    }

    .ValueSelector__menu {
        z-index: 10;
        max-width: 100%;

        .value-menu-option {
            justify-content: space-between;
            display: flex;
        }

        .label-container {
            max-width: 90%;
        }
    }
`;

const PropertyName = styled.span`
    margin-right: 5px;
    color: rgba(var(--center-channel-color-rgb), 0.6);
`;

type PostAttachmentProps = {
    postId: string;
}

const PostAttachment = ({postId}: PostAttachmentProps) => {
    const dispatch = useDispatch();
    const properties = useSelector<GlobalState, Property[]>(getPropertiesForObject(postId));

    useEffect(() => {
        fetchPropertiesForObject(postId).
            then((res) => dispatch(receivedPropertiesForObject(postId, res || [])));
    }, [postId]);

    return (
        <PropertyContainer>
            {properties.map((p) => (
                <PropertyBlock key={p.id}>
                    <PropertyName>{p.property_field_name + ': '}</PropertyName>
                    <PropertyElement
                        id={p.id}
                        name={p.property_field_name}
                        type={p.property_field_type}
                        value={p.value}
                        possibleValues={p.property_field_values}
                    />
                </PropertyBlock>
            ))}
        </PropertyContainer>
    );
};

export default PostAttachment;
