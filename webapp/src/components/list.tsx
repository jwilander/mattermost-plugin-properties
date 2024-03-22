// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Post as PostType} from '@mattermost/types/lib/posts';

import Post from 'src/components/post';

type ListProps = {
    id: string;
    posts: PostType[];
}

const List = ({id, posts}: ListProps) => {
    return (
        <>
            {posts.map((p) => (
                <Post
                    key={`post-${id}-${p.id}`}
                    id={p.id}
                    create_at={p.create_at}
                    userID={p.user_id}
                    message={p.message}
                />
            ))}
        </>
    );
};

export default List;
