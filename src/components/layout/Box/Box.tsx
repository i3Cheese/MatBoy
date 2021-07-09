import React, {ComponentProps, FC} from 'react';
import './Box.scss';

interface BoxProps extends ComponentProps<'div'> {
    size?: "tiny" | "middle" | "large",
}

export const Box: FC<BoxProps> = (
    {
        size,
        children,
        className,
        ...props
    }) => {
    return (
        <div className={"box" + (size && ` box-${size} `) + (className || "")} {...props}>
            {children}
        </div>
    );
}

export const BoxTitle: FC<ComponentProps<'div'>> = ({children, className,...props}) => {
    return (
        <div className={"box_title"+ (className || "")} {...props}>
            {children}
        </div>
    );
}


export const BoxContainer: FC<ComponentProps<'div'>> = ({children, className,...props}) => {
    return (
        <div className={"box_container"+ (className || "")} {...props}>
            {children}
        </div>
    );
}
