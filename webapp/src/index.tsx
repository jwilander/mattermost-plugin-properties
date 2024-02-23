import {Store, Action} from 'redux';

import {GlobalState} from '@mattermost/types/lib/store';

import {manifest} from 'src/manifest';
import {PluginRegistry} from 'src/types/mattermost-webapp';
import reducer from 'src/reducer';
import {displayManageFieldsModal, receivedProperty} from 'src/actions';
import PostAttachment from 'src/components/post_attachment';
import {createProperty, fetchPropertyFieldsForTerm} from 'src/client';
import {Property, PropertyField} from 'src/types/property';
import {ReceivedProperty} from 'src/types/actions';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        registry.registerReducer(reducer);
        registry.registerPostMessageAttachmentComponent(PostAttachment);
        registry.registerMainMenuAction('Manage Fields', () => store.dispatch(displayManageFieldsModal({})));
        const {rootRegisterMenuItem} = registry.registerPostDropdownSubMenuAction('Add Property');

        const fields = await fetchPropertyFieldsForTerm('');

        const makeCreateProperty = (field: PropertyField) => {
            return async (postID: string) => {
                let defaultValue = [] as string[];
                if (field.type === 'select') {
                    defaultValue = field?.values ? [field.values[0]] : [];
                }
                const {id} = await createProperty(postID, 'post', field.id, defaultValue);
                store.dispatch<ReceivedProperty>(receivedProperty({
                    id,
                    object_id: postID,
                    object_type: 'post',
                    property_field_id: field.id,
                    property_field_name: field.name,
                    property_field_type: field.type,
                    property_field_values: field.values,
                    value: defaultValue,
                } as Property));
            };
        };

        fields.forEach((field) => {
            rootRegisterMenuItem(
                field.name,
                makeCreateProperty(field),
            );
        });
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());
