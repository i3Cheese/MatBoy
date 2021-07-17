import React, {ComponentProps, FC} from 'react';

export interface SimpleMenuProps extends ComponentProps<'div'> {
}

const SimpleMenu: FC<SimpleMenuProps> = ({children, className, ...props}) => {
    return (
        <div className={"simple_menu " + className || ""} {...props}>
            {React.Children.map(children,
                (el, index) => index==0?el:[" | ", el])}
        </div>
    )
}
export default SimpleMenu;
