import React, {ComponentProps, FC} from 'react';
import {Breadcrumb, BreadcrumbItem, BreadcrumbItemProps, BreadcrumbProps} from "react-bootstrap";

export interface SimpleMenuProps extends ComponentProps<'div'> {
}

const RawSimpleMenu: FC<BreadcrumbProps> = ({children, className, ...props}) => {
    return (
        <Breadcrumb className={"simple_menu " + className || ""} {...props}>
            {children}
            {/*{React.Children.map(children,*/}
            {/*    (el, index) => index==0?el:[" | ", el])}*/}
        </Breadcrumb>
    )
}

export const SimpleMenuItem: FC<BreadcrumbItemProps> = ({children, ...props}) => (
    <BreadcrumbItem {...props}>
        {children}
    </BreadcrumbItem>
)

export const SimpleMenu = Object.assign(RawSimpleMenu, {
    Item: SimpleMenuItem
});
export default SimpleMenu;
