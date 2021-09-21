import React, {ComponentProps, FC} from 'react';
import './Box.scss';
import classnames from "classnames";
import {BsPrefixProps, BsPrefixRefForwardingComponent} from "react-bootstrap/helpers";

export interface BoxProps extends BsPrefixProps {
    size?: "tiny" | "middle" | "large" | "full",
    type?: "square",
    title?: null | React.ReactNode,
    className?: string,
    border?: string,
}

const RawBox: BsPrefixRefForwardingComponent<'div', BoxProps> =
    React.forwardRef<HTMLElement, BoxProps>(
        (
            {
                size,
                type,
                children,
                className,
                title,
                border,
                as: Component= 'div',
                ...props
            }, ref) => {
            return (
                <Component
                    ref={ref}
                    className={classnames(
                        "box",
                        size && `box-${size}`,
                        type && `box-${type}`,
                        border && `border border-${border}`,
                        className,
                    )}
                    {...props}
                >
                    {title != null &&
                    <BoxTitle>
                        {title}
                    </BoxTitle>
                    }
                    {children}
                </Component>
            );
        }
    )

export const BoxTitle: FC<ComponentProps<'div'>> = ({children, className, ...props}) => {
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
