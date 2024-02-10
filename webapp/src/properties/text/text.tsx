// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import BaseTextEditor from 'src/properties/base_text_editor';

import {PropertyProps} from 'src/properties/types';

const Text = (props: PropertyProps): JSX.Element => {
    return (
        <BaseTextEditor
            {...props}
            validator={() => true}
            spellCheck={true}
        />
    );
};

export default Text;
