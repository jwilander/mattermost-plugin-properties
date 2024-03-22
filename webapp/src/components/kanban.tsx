// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Post as PostType} from '@mattermost/types/lib/posts';

type KanbanProps = {
    id: string;
    posts: PostType[];
}

const Kanban = ({id, posts}: KanbanProps) => {
    return (
        <>
        </>
    );
};

export default Kanban;
