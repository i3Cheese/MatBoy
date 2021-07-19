import React, {ComponentProps, FC} from 'react';
import './PageHeader.scss'

export const PageHeader: FC<ComponentProps<'div'>> = ({className, children, ...props}) => {
    return (
        <div className={"page_header " + className || ""} {...props}>
            {children}
        </div>
    );
}

export const PageHeaderTitle: FC<ComponentProps<'h1'>> = ({className, children, ...props}) => (
    <h1 className={"page_header_title"} {...props}>
        {children}
    </h1>
)