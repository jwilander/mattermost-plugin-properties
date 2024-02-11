// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';

import {PropertyTypeEnum} from 'src/types/property';
import propsRegistry from 'src/properties';
import {updatePropertyValue} from 'src/client';
import {receivedPropertyValue} from 'src/actions';

type PropertyProps = {
    id: string;
    objectId: string;
    name: string;
    type: PropertyTypeEnum;
    value: string[];
    possibleValues: string[] | null;
}

const PropertyStyle = styled.div`
`;

const PropertyElement = ({id, objectId, name, type, value, possibleValues}: PropertyProps) => {
    const dispatch = useDispatch();

    const property = propsRegistry.get(type);
    const Editor = property.Editor;

    //TODO: implement
    const readOnly = false;
    const showEmptyPlaceholder = false;

    const onChange = (newValue: string[]) => {
        updatePropertyValue(id, newValue).then(
            () => {
                dispatch(receivedPropertyValue(id, objectId, newValue));
            },
        );
    };

    return (
        <Editor
            id={id}
            readOnly={readOnly}
            showEmptyPlaceholder={showEmptyPlaceholder}
            value={value}
            name={name}
            possibleValues={possibleValues}
            onChange={onChange}
        />
    );
};

export default PropertyElement;
