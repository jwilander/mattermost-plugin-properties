// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {PropertyTypeEnum} from 'src/types/property';
import propsRegistry from 'src/properties';

type PropertyProps = {
    id: string;
    name: string;
    type: PropertyTypeEnum;
    value: string[];
    possibleValues: string[] | null;
}

const PropertyStyle = styled.div`
`;

const PropertyElement = ({id, name, type, value, possibleValues}: PropertyProps) => {
    const property = propsRegistry.get(type);
    const Editor = property.Editor;

    //TODO: implement
    const readOnly = false;
    const showEmptyPlaceholder = false;

    return (
        <Editor
            id={id}
            readOnly={readOnly}
            showEmptyPlaceholder={showEmptyPlaceholder}
            value={value}
            name={name}
            possibleValues={possibleValues}
        />
    );
};

export default PropertyElement;
