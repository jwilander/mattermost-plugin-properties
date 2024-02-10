// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PropertyTypeEnum} from 'src/types/property';
import {PropertyType} from 'src/properties/types';

import SelectProperty from 'src/properties/select/property';
import TextProperty from 'src/properties/text/property';
import UnknownProperty from 'src/properties/unknown/property';

class PropertiesRegistry {
    properties: {[key: string]: PropertyType} = {};
    propertiesList: PropertyType[] = [];
    unknownProperty: PropertyType = new UnknownProperty();

    register(prop: PropertyType) {
        this.properties[prop.type] = prop;
        this.propertiesList.push(prop);
    }

    unregister(prop: PropertyType) {
        delete this.properties[prop.type];
        this.propertiesList = this.propertiesList.filter((p) => p.type === prop.type);
    }

    list() {
        return this.propertiesList;
    }

    get(type: PropertyTypeEnum) {
        return this.properties[type] || this.unknownProperty;
    }
}

const registry = new PropertiesRegistry();
registry.register(new TextProperty());
registry.register(new SelectProperty());

export default registry;
