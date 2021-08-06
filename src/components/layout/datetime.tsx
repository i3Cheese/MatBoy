import React, {ComponentProps, FC} from 'react';

export const DateSpan: FC<ComponentProps<'span'> & { date: Date | null}> = ({date, className, children, ...props}) => {
    return (
        <span className={'date'+ (className || "")} {...props}>
            {date!=null?date.toLocaleDateString():"Не известно"}
            {children}
        </span>
    );
};
export const DateTimeSpan: FC<ComponentProps<'span'> & { date: Date | null}> = ({date, className, children, ...props}) => {
    return (
        <span className={'date datetime'+ (className || "")} {...props}>
            {date!=null?`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`:"Не известно"}
            {children}
        </span>
    );
};
