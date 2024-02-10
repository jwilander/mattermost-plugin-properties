// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState, useRef, useEffect} from 'react';

import Editable from 'src/widgets/editable';

import {PropertyProps} from 'src/properties/types';

const BaseTextEditor = (props: PropertyProps & {validator: () => boolean, spellCheck?: boolean}): JSX.Element => {
    const [value, setValue] = useState(props.value[0] || '');
    const onCancel = useCallback(() => setValue(props.value[0] || ''), [props.value]);

    const saveTextProperty = useCallback(() => {
        //TODO: implement
    }, []);

    const saveTextPropertyRef = useRef<() => void>(saveTextProperty);
    if (props.readOnly) {
        saveTextPropertyRef.current = () => null;
    } else {
        saveTextPropertyRef.current = saveTextProperty;
    }

    //TODO: implement i18n
    const emptyDisplayValue = 'Empty';

    useEffect(() => {
        return () => {
            saveTextPropertyRef?.current();
        };
    }, []);

    if (!props.readOnly) {
        return (
            <Editable
                placeholderText={emptyDisplayValue}
                value={value.toString()}
                autoExpand={true}
                onChange={setValue}
                onSave={saveTextProperty}
                onCancel={onCancel}
                validator={props.validator}
                spellCheck={props.spellCheck}
            />
        );
    }
    return <div>{props.value[0]}</div>;
};

export default BaseTextEditor;
