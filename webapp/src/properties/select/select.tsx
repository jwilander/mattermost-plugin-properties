// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';

import ValueSelector, {PropertyOption} from 'src/widgets/value_selector';
import Label from 'src/widgets/label';

import {PropertyProps} from 'src/properties/types';

const SelectProperty = (props: PropertyProps) => {
    const {value, possibleValues, readOnly, onChange} = props;

    const [open, setOpen] = useState(false);

    const onCreate = useCallback((newValue) => {
        //TODO: implement
    }, []);

    const emptyDisplayValue = 'Empty';

    const onChangeColor = useCallback(() => {}, []);
    const onDeleteOption = useCallback(() => {}, []);
    const onDeleteValue = useCallback(() => {}, []);

    const displayValue = Array.isArray(value) && value.length > 0 ? value[0] : value;
    const finalDisplayValue = displayValue || emptyDisplayValue;

    if (readOnly || !open) {
        return (
            <div
                data-testid='select-non-editable'
                tabIndex={0}
                onClick={() => setOpen(true)}
            >
                <Label empty={false}>
                    <span>{finalDisplayValue}</span>
                </Label>
            </div>
        );
    }

    const options = possibleValues?.map((v: string) => ({value: v, label: v} as PropertyOption));

    return (
        <ValueSelector
            emptyValue={emptyDisplayValue}
            options={options || []}
            value={{value: displayValue, label: displayValue} as PropertyOption}
            onCreate={onCreate}
            onChange={onChange}
            onChangeColor={onChangeColor}
            onDeleteOption={onDeleteOption}
            onDeleteValue={onDeleteValue}
            onBlur={() => setOpen(false)}
        />
    );
};

export default React.memo(SelectProperty);
