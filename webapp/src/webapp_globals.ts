// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const {
    formatText,
    messageHtmlToComponent,

    // @ts-ignore
} = global.PostUtils ?? {};

export const {
    modals,

// @ts-ignore
}: {modals: any} = global.WebappUtils ?? {};

export const {
    Timestamp,

    // @ts-ignore
} = global.Components ?? {};
