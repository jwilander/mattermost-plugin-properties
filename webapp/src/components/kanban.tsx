// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Post as PostType} from '@mattermost/types/lib/posts';

import {ViewFormat} from 'src/types/property';
import {getPropertyField} from '@/selectors';

type KanbanProps = {
    id: string;
    posts: PostType[];
    format: ViewFormat;
}

const Kanban = ({id, posts, format}: KanbanProps) => {
    const groupByField = useSelector(getPropertyField(format.group_by_field_id), [format.group_by_field_id]);

    if (!groupByField) {
        return null;
    }

    useEffect(() => {
        console.log(format);
    }, []);

    return (
        <>
        </>
    );
};

export default Kanban;

