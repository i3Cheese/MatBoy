import React, {ComponentProps, FC} from 'react';

export const DateSpan: FC<ComponentProps<'span'> & { date: Date }> = ({date, className, children, ...props}) => {
    return (
        <span className={'date'+ (className || "")} {...props}>
            {date.getDate()}
            {children}
        </span>
    );
};
