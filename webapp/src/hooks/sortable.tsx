// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef} from 'react';
import {useDrag, useDrop, DragElementWrapper, DragSourceOptions, DragPreviewOptions} from 'react-dnd';

import {ObjectWithProperties} from 'src/types/property';

interface ISortableWithGripItem {
    object: ObjectWithProperties | ObjectWithProperties[]
    cords: {x: number, y?: number, z?: number}
}

type IContentObjectWithCords = {
    object: ObjectWithProperties
    cords: {x: number, y?: number, z?: number}
}

function useSortableBase<T>(itemType: string, item: T, enabled: boolean, handler: (src: T, st: T) => void): [boolean, boolean, DragElementWrapper<DragSourceOptions>, DragElementWrapper<DragSourceOptions>, DragElementWrapper<DragPreviewOptions>] {
    const [{isDragging}, drag, preview] = useDrag(() => ({
        type: itemType,
        item,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => enabled,
    }), [itemType, item, enabled]);
    const [{isOver}, drop] = useDrop(() => ({
        accept: itemType,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        drop: (dragItem: T) => {
            handler(dragItem, item);
        },
        canDrop: () => enabled,
    }), [item, handler, enabled]);

    return [isDragging, isOver, drag, drop, preview];
}

export function useSortable<T>(itemType: string, item: T, enabled: boolean, handler: (src: T, st: T) => void): [boolean, boolean, React.RefObject<HTMLDivElement>] {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, isOver, drag, drop] = useSortableBase(itemType, item, enabled, handler);
    drop(drag(ref));
    return [isDragging, isOver, ref];
}

export function useSortableWithGrip(itemType: string, item: ISortableWithGripItem, enabled: boolean, handler: (src: IContentObjectWithCords, st: IContentObjectWithCords) => void): [boolean, boolean, React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>] {
    const ref = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [isDragging, isOver, drag, drop, preview] = useSortableBase(itemType, item as IContentObjectWithCords, enabled, handler);
    drag(ref);
    drop(preview(previewRef));
    return [isDragging, isOver, ref, previewRef];
}
