
type PostMenuAction = (postID: string) => void;
type PostMenuFilter = (postID: string) => boolean;
export interface PluginRegistry {
    registerReducer(reducer: any)
    registerPostMessageAttachmentComponent(component: React.ElementType)
    registerMainMenuAction(text: string, action: () => void, mobileIcon?: React.ElementType)
    registerPostDropdownSubMenuAction(text: string, action?: PostMenuAction, filter?: PostMenuFilter) : {id: string, rootRegisterMenuItem: (innerText: string, innerAction: PostMenuAction, innerFilter?: PostMenuFilter) => void}
    registerLeftHandSidebarItem(text: string, route: string, component: React.Element)

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
