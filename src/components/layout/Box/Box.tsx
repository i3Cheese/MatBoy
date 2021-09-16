import React, {ComponentProps, FC} from 'react';
import './Box.scss';
import classnames from "classnames";

export interface BoxProps {
    size?: "tiny" | "middle" | "large",
    type?: "square",
    title?: null | React.ReactNode,
    className?: string,
    border?: string,
}

const RawBox: FC<BoxProps> = (
    {
        size,
        type,
        children,
        className,
        title,
        border,
    }) => {
    let classes = ["box",];
    if (size) classes.push("box-"+size);
    if (type) classes.push("box-"+type);
    if (className) classes.push(className);
    if (border) classes.push(`border border-${border}`);
    return (
        <div className={classes.join(' ')}>
            {title != null &&
                <BoxTitle>
                    {title}
                </BoxTitle>
            }
            {children}
        </div>
    );
}

export const BoxTitle: FC<ComponentProps<'div'>> = ({children, className,...props}) => {
    return (
        <div className={classnames("box_title", className)} {...props}>
            {children}
        </div>
    );
}

export const Box = Object.assign(RawBox, {
    Title: BoxTitle,
});

export default Box;
