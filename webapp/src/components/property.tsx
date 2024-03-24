// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';

import {PropertyTypeEnum} from 'src/types/property';
import propsRegistry from 'src/properties';
import {deleteProperty, updatePropertyValue} from 'src/client';
import {deletedProperty, receivedPropertyValue} from 'src/actions';
import IconButton from 'src/widgets/buttons/icon_button';
import CloseIcon from 'src/widgets/icons/close';

type PropertyProps = {
    id: string;
    objectID: string;
    objectType: string;
    name: string;
    type: PropertyTypeEnum;
    value: string[];
    possibleValues: string[] | null | undefined;
}

const PropertyBlock = styled.div`
    padding: 5px 6px;
    background: rgba(var(--center-channel-color-rgb), 0.08);
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 5px;

    .ValueSelector {
        padding: 4px 0;
        background-color: rgba(var(--center-channel-color-rgb), 0.08);
        width: auto;
        border-radius: 2px;
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

const PropertyElement = ({id, objectID, objectType, name, type, value, possibleValues}: PropertyProps) => {
    const dispatch = useDispatch();
    const [isHover, setHover] = useState(false);

    const property = propsRegistry.get(type);
    const Editor = property.Editor;

    //TODO: implement
    const readOnly = false;
    const showEmptyPlaceholder = false;

    const onChange = (newValue: string[]) => {
        updatePropertyValue(id, newValue).then(
            () => {
                dispatch(receivedPropertyValue(id, objectID, newValue));
            },
        );
    };

    const onDelete = () => {
        deleteProperty(id).then(
            () => {
                dispatch(deletedProperty(id, objectID));
            },
        );
    };

    const onMouseEnter = () => setHover(true);
    const onMouseLeave = () => setHover(false);

    return (
        <PropertyBlock
            key={id}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <PropertyName>{name + ': '}</PropertyName>
            <Editor
                id={id}
                objectID={objectID}
                objectType={objectType}
                readOnly={readOnly}
                showEmptyPlaceholder={showEmptyPlaceholder}
                value={value}
                name={name}
                possibleValues={possibleValues}
                onChange={onChange}
            />
            {isHover ? (
                <IconButton
                    onClick={onDelete}
                    icon={<CloseIcon/>}
                    title='Remove'
                    style={{marginLeft: 5}}
                />
            ) : <></>}

        </PropertyBlock>

    );
};

export default PropertyElement;
