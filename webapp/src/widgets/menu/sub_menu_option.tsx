// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState, useContext, CSSProperties, useRef} from 'react';
import styled from 'styled-components';

import CompassIcon from 'src/widgets/icons/compass_icon';

import MenuUtil from './menu_util';

import Menu from '.';

export const HoveringContext = React.createContext(false);

type SubMenuOptionProps = {
    id: string
    name: string
    position?: 'bottom' | 'top' | 'left' | 'left-bottom' | 'auto'
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
}

const SubMenuOptionContainer = styled.div`
    .Menu .menu-options .SubMenuOption {
        &.menu-option {
            padding-right: 16px;
        }
    }

    position: relative;

    .SubMenu {
        z-index: 16;
        position: absolute;
        min-width: 180px;
        background-color: rgb(var(--center-channel-bg-rgb));
        color: rgb(var(--center-channel-color-rgb));
        margin: 0 !important;

        border-radius: var(--default-rad);
        box-shadow: var(--elevation-4);
        left: 100%;

        &.top {
            bottom: 0;
        }

        &.bottom {
            top: 0;
        }

        &.left {
            left: -100%;
            right: 100%;
        }

        &.left-bottom {
            left: -100%;
            right: 100%;
            top: 0;
        }
    }

    @media screen and (max-width: 430px) {
        .SubMenu {
            background-color: rgba(var(--center-channel-color-rgb), 0.8) !important;
        }
    }
`;

function SubMenuOption(props: SubMenuOptionProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const isHovering = useContext(HoveringContext);

    const openLeftClass = props.position === 'left' || props.position === 'left-bottom' ? ' open-left' : '';

    useEffect(() => {
        if (isHovering !== undefined) {
            setIsOpen(isHovering);
        }
    }, [isHovering]);

    const ref = useRef<HTMLDivElement>(null);

    const styleRef = useRef<CSSProperties>({});

    useEffect(() => {
        const newStyle: CSSProperties = {};
        if (props.position === 'auto' && ref.current) {
            const openUp = MenuUtil.openUp(ref);
            if (openUp.openUp) {
                newStyle.bottom = 0;
            } else {
                newStyle.top = 0;
            }
        }

        styleRef.current = newStyle;
    }, [ref.current]);

    return (
        <SubMenuOptionContainer
            id={props.id}
            className={`SubMenuOption MenuOption menu-option${openLeftClass}${isOpen ? ' menu-option-active' : ''}${props.className ? ' ' + props.className : ''}`}
            onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen((open) => !open);
            }}
            ref={ref}
        >
            {props.icon ? <div className='menu-option__icon'>{props.icon}</div> : <div className='noicon'/>}
            <div className='menu-name'>{props.name}</div>
            <CompassIcon icon='chevron-right'/>
            {isOpen &&
                <div
                    className={'SubMenu Menu noselect ' + (props.position || 'bottom')}
                    style={styleRef.current}
                >
                    <div className='menu-contents'>
                        <div className='menu-options'>
                            {props.children}
                        </div>
                        <div className='menu-spacer hideOnWidescreen'/>

                        <div className='menu-options hideOnWidescreen'>
                            <Menu.Text
                                id='menu-cancel'
                                name={'Cancel'}
                                className='menu-cancel'
                                onClick={() => undefined}
                            />
                        </div>
                    </div>

                </div>
            }
        </SubMenuOptionContainer>
    );
}

export default React.memo(SubMenuOption);
