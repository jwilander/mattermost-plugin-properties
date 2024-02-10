// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {CSSProperties} from 'react';
import styled, {css} from 'styled-components';

import SeparatorOption from './separator_option';
import TextOption from './text_option';
import SubMenuOption, {HoveringContext} from './sub_menu_option';
import LabelOption from './label_option';

import MenuUtil from './menu_util';

type Props = {
    children: React.ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
    fixed?: boolean
    parentRef?: React.RefObject<any>
}

const MenuContainer = styled.div<{fixed: boolean}>`
    z-index: 15;
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: rgb(var(--center-channel-bg-rgb));
    color: rgb(var(--center-channel-color-rgb));
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    border-radius: var(--default-rad);
    box-shadow: var(--elevation-4);
    max-width: 320px;
    cursor: default;

    ${(props) => props.fixed && css`
        position: fixed;
    `};

    @media not screen and (max-width: 430px) {
        &.top {
            bottom: 100%;
        }

        &.left {
            right: 0;
        }
    }

    .Menu.noselect,
.SubMenuOption .SubMenu {
    @media screen and (max-width: 430px) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        min-width: 0;
        background-color: rgba(var(--center-channel-color-rgb), 0.5);
        border-radius: 0;
        padding: 10px;

        display: block;
        overflow-y: auto;

        .menu-contents {
            justify-content: flex-end;
            min-height: 100%;
        }

        .menu-options {
            align-items: center;
            border-radius: 10px;
            overflow: hidden;

            flex: 0 0 auto;

            .menu-option {
                min-height: 44px;
                width: 100%;
                padding: 0 20px;
                background-color: rgb(var(--center-channel-bg-rgb));

                > * {
                    flex: 0 0 auto;
                }

                > .noicon {
                    width: 16px;
                    height: 16px;
                    margin-right: 12px;
                }

                > .menu-name {
                    font-size: 16px;
                    justify-content: center;
                }
            }
        }
    }

    @media not screen and (max-width: 430px) {
        .hideOnWidescreen {
            /* Hide controls (e.g. close button) on larger screens */
            display: none !important;
        }
    }
}
`;

const MenuContents = styled.div`
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    min-width: 240px;
    max-width: 320px;
`;

const MenuSpacer = styled.div`
    height: 20px;
    width: 20px;
    flex: 0 0 auto;
`;

const MenuOptions = styled.div`
    display: flex;
    flex-direction: column;

    flex-grow: 1;
    position: relative;

    list-style: none;
    padding: 0;
    margin: 0;

    color: rgb(var(--center-channel-color-rgb));

    .CompassIcon {
        font-size: 18px;
        opacity: 0.56;
        width: 18px;

        &::before {
            margin: 0;
        }
    }

    .menu-option__content {
        overflow: hidden;
        flex: 1;
    }

    .menu-option {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        position: relative;
        font-size: 14px;
        line-height: 24px;
        font-weight: 400;
        height: 32px;
        padding: 4px 20px;
        white-space: nowrap;
        cursor: pointer;

        &.menu-option--disabled {
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.32;
        }

        &.menu-option--with-subtext {
            height: auto;
            align-items: initial;
        }

        &:hover {
            background: rgba(var(--button-bg-rgb), 0.08);
        }

        &-active {
            background: rgba(var(--button-bg-rgb), 0.08);
        }

        .empty-icon {
            width: 18px;
        }

        .noicon {
            &:empty {
                display: none;
            }
        }

        > *:first-child {
            margin-left: 0;
        }

        > .menu-content {
            display: block;
        }

        .menu-name {
            overflow: hidden;
            text-overflow: ellipsis;
            flex-grow: 1;
            white-space: nowrap;
            text-align: left;
        }

        > .menu-subtext {
            font-size: 10px;
            text-align: left;
        }

        > .SubmenuTriangleIcon {
            fill: currentColor;
        }

        .Icon {
            opacity: 0.56;
            width: 18px;
            height: 18px;
            flex: 0 0 18px;
        }

        .IconButton .Icon {
            margin-right: 0;
        }
    }

    * > .menu-option.bold-menu-text {
        font-weight: bold;
    }

    .menu-option__icon {
        display: flex;
        align-items: center;
        margin-right: 12px;
    }

    .menu-option__check {
        color: rgba(var(--button-bg-rgb), 1);

        svg {
            stroke: currentColor;
        }
    }
`;

export default class Menu extends React.PureComponent<Props> {
    //static Color = ColorOption;
    //static Switch = SwitchOption;
    //static TextInput = textInputOption;
    static SubMenu = SubMenuOption;
    static Separator = SeparatorOption;
    static Text = TextOption;
    static Label = LabelOption;

    menuRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.menuRef = React.createRef<HTMLDivElement>();
    }

    public state = {
        hovering: null,
        menuStyle: {},
    };

    public render(): JSX.Element {
        const {position, fixed, children} = this.props;

        let style: CSSProperties = {};
        if (this.props.parentRef) {
            const forceBottom = position ? ['bottom', 'left', 'right'].includes(position) : false;
            style = MenuUtil.openUp(this.props.parentRef, forceBottom).style;
        }

        return (
            <MenuContainer
                className={`Menu noselect ${position || 'bottom'}`}
                style={style}
                ref={this.menuRef}
                fixed={Boolean(fixed)}
            >
                <MenuContents>
                    <MenuOptions className='menu-options'>
                        {React.Children.map(children, (child) => (
                            <div
                                onMouseEnter={() => this.setState({hovering: child})}
                            >
                                <HoveringContext.Provider value={child === this.state.hovering}>
                                    {child}
                                </HoveringContext.Provider>
                            </div>))}
                    </MenuOptions>

                    <MenuSpacer className='menu-spacer hideOnWidescreen'/>

                    <MenuOptions className='menu-options hideOnWidescreen'>
                        <Menu.Text
                            id='menu-cancel'
                            name={'Cancel'}
                            className='menu-cancel'
                            onClick={this.onCancel}
                        />
                    </MenuOptions>
                </MenuContents>
            </MenuContainer>
        );
    }

    private onCancel = () => {
        // No need to do anything, as click bubbled up to MenuWrapper, which closes
    };
}
