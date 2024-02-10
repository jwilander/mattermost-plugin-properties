// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function generateClassName(conditions: Record<string, boolean>): string {
    return Object.entries(conditions).map(([className, condition]) => (condition ? className : '')).filter((className) => className !== '').join(' ');
}
