import React, {ComponentProps, FC} from 'react';
import './Box.scss';

interface BoxProps extends ComponentProps<'div'> {
    size?: "tiny" | "middle" | "large",
    type?: "square",
}

export const Box: FC<BoxProps> = (
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

export const InfoInBox: FC<ComponentProps<'dl'>> = ({className, children, ...props}) => (
    <dl className={'row info_in_box' + (className || "")} {...props}>
        {children}
    </dl>
)

export const BoxTitle: FC<ComponentProps<'div'>> = ({children, className,...props}) => {
    return (
        <div className={"box_title"+ (className || "")} {...props}>
            {children}
        </div>
    );
}


interface BoxContainerProps extends ComponentProps<'div'> {
    covid?: boolean,
}
export const BoxContainer: FC<BoxContainerProps> = ({children, className, covid, ...props}) => {
    return (
        <div className={"box_container " + (covid?"box_container-covid ":"") + (className || "")} {...props}>
            {children}
        </div>
    );
}
