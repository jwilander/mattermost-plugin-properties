export interface PluginRegistry {
    registerReducer(reducer: any)
    registerPostMessageAttachmentComponent (component: React.ElementType)
    registerMainMenuAction(text: string, action: () => void, mobileIcon?: React.ElementType)

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
