// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {IntlProvider} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled, {css} from 'styled-components';
import {GlobalState} from '@mattermost/types/store';

import {fetchPropertiesForObject} from 'src/client';
import {receivedPropertiesForObject} from 'src/actions';
import {getPropertiesForObject} from 'src/selectors';

import {Property} from 'src/types/property';

import PropertyElement from './property';
import AddProperty from './add_property';
import ManageFields from './manage_fields';

const PropertyContainer = styled.div<{showAdd?: boolean}>`
    display: flex;
    flex-direction: row;
    width: 100%;

    .AddProperty, .ManageFields {
        display: none;
    }

    ${(props) => props.showAdd && css`
        .AddProperty, .ManageFields {
            display: flex;
        }
    `}
`;

type PostAttachmentProps = {
    postId: string;
}

const PostAttachment = ({postId}: PostAttachmentProps) => {
    const dispatch = useDispatch();
    const [isHover, setHover] = useState(false);
    const [isAddOpen, setAddOpen] = useState(false);
    const properties = useSelector<GlobalState, Property[]>(getPropertiesForObject(postId));

    useEffect(() => {
        fetchPropertiesForObject(postId).
            then((res) => dispatch(receivedPropertiesForObject(postId, res || [])));
    }, [dispatch, postId]);

    const onMouseEnter = () => setHover(true);
    const onMouseLeave = () => setHover(false);

    return (
        <IntlProvider locale='en'>
            <PropertyContainer
                className='PropertyContainer'
                showAdd={isHover || isAddOpen}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {properties.map((p) => (
                    <PropertyElement
                        key={p.id}
                        id={p.id}
                        objectId={postId}
                        name={p.property_field_name}
                        type={p.property_field_type}
                        value={p.value}
                        possibleValues={p.property_field_values}
                    />
                ))}
                {properties.length > 0 ? <>
                    <AddProperty
                        objectId={postId}
                        objectType='post'
                        onOpenChange={setAddOpen}
                    />
                    <ManageFields/>
                </> : null}
            </PropertyContainer>
        </IntlProvider>
    );
};

export default PostAttachment;
