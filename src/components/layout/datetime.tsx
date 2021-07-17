import React, {ComponentProps, FC} from 'react';
import moment from "moment";

export const DateSpan: FC<ComponentProps<'span'> & { date: Date | null}> = ({date, className, children, ...props}) => {
    return (
        <span className={'date'+ (className || "")} {...props}>
            {date!==null?date.toLocaleDateString():"Не известно"}
            {children}
        </span>
    );
};
