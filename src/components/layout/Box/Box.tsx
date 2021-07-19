import React, {ComponentProps, FC} from 'react';
import './Box.scss';

export interface BoxProps extends ComponentProps<'div'> {
    size?: "tiny" | "middle" | "large",
    type?: "square",
}

const RawBox: FC<BoxProps> = (
    {
        size,
        type,
        children,
        className,
        ...props
    }) => {
    let classes = ["box",];
    if (size) classes.push("box-"+size);
    if (type) classes.push("box-"+type);
    if (className) classes.push(className);
    return (
        <div className={classes.join(' ')} {...props}>
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

export const Box = Object.assign(RawBox, {
    Title: BoxTitle,
});

export default Box;
