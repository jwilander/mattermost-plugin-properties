// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {ClientError} from '@mattermost/client';

import {manifest} from './manifest';
import {Property, PropertyField} from './types/property';

let siteURL = '';
let basePath = '';
let apiUrl = `${basePath}/plugins/${manifest.id}/api/v0`;

export const setSiteUrl = (url?: string): void => {
    if (url) {
        basePath = new URL(url).pathname.replace(/\/+$/, '');
        siteURL = url;
    } else {
        basePath = '';
        siteURL = '';
    }

    apiUrl = `${basePath}/plugins/${manifest.id}/api/v0`;
};

export const getSiteUrl = (): string => {
    return siteURL;
};

export const getApiUrl = (): string => {
    return apiUrl;
};

export async function createProperty(object_id: string, object_type: string, property_field_id: string, value: string[]) {
    const data = await doPost(`${apiUrl}/property`, JSON.stringify({object_id, object_type, property_field_id, value}));
    return data as {id: string};
}

export async function fetchPropertiesForObject(objectID: string) {
    const data = await doGet(`${apiUrl}/property/object/${objectID}`);

    return data as Property[];
}

export async function updatePropertyValue(id: string, value: string[]) {
    await doPut(`${apiUrl}/property/${id}`, JSON.stringify({value}));
}

export async function createPropertyField(name: string, type: string, values: string[] | null | undefined) {
    const data = await doPost(`${apiUrl}/field`, JSON.stringify({name, type, values}));
    return data as {id: string};
}

export async function fetchPropertyFieldsForTerm(term: string) {
    const data = await doGet(`${apiUrl}/field/autocomplete?term=${term}`);

    return data as PropertyField[];
}

export async function updatePropertyField(id: string, type: string, name: string, values: string[] | null | undefined) {
    await doPut(`${apiUrl}/field/${id}`, JSON.stringify({name, type, values}));
}

export const doGet = async <TData = any>(url: string) => {
    const {data} = await doFetchWithResponse<TData>(url, {method: 'get'});

    return data;
};

export const doPost = async <TData = any>(url: string, body = {}) => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'POST',
        body,
    });

    return data;
};

export const doPut = async <TData = any>(url: string, body = {}) => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'PUT',
        body,
    });

    return data;
};

export const doFetchWithResponse = async <TData = any>(url: string, options = {}) => {
    const response = await fetch(url, Client4.getOptions(options));
    let data;
    if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType === 'application/json') {
            data = await response.json() as TData;
        }

        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

export const doFetchWithTextResponse = async <TData extends string>(url: string, options = {}) => {
    const response = await fetch(url, Client4.getOptions(options));

    let data;
    if (response.ok) {
        data = await response.text() as TData;

        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

export const doFetchWithoutResponse = async (url: string, options = {}) => {
    const response = await fetch(url, Client4.getOptions(options));

    if (response.ok) {
        return;
    }

    throw new ClientError(Client4.url, {
        message: '',
        status_code: response.status,
        url,
    });
};
