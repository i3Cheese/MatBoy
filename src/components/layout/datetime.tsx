import React, {ComponentProps, FC} from 'react';
import classnames from "classnames";
import {fromUTCToLocal} from "../../helpers/datetime";

interface DateSpanProps extends ComponentProps<'span'> {
    date: Date | null,
    local?: boolean,
    time?: boolean,
}

//
// export function dateString(date?: Date, global: boolean = false, time: boolean = true) {
//     if (date == null) return "Не известно";
//     if (global) date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDay(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
//     if (time) {
//         return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
//     } else {
//         return `${date.toLocaleDateString()}`;
//     }
// }
export function timezoneOffsetString(date?: Date) {
    let offset: number = -(date !== undefined ? date.getTimezoneOffset() : Date.prototype.getTimezoneOffset());
    return `UTC${offset > 0 ? '+' : ''}${offset / 60}`
}

export const DateSpan: FC<DateSpanProps> = ({date, className, children, local, time, ...props}) => {
    className = classnames(className, 'date', time && 'time');
    if (date == null) return <span className={classnames('date-unspecified', className)}>{"Не известно"}</span>;
    if (!local) date = fromUTCToLocal(date);
    let options: Intl.DateTimeFormatOptions = time ?
        {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}
        :
        {year: 'numeric', month: 'numeric', day: 'numeric'};
    return (
        <span className={className} {...props}>
            {date.toLocaleDateString([], options)}
            {local && <sup title={"timezone offset"}>{timezoneOffsetString(date)}</sup>}
        </span>
    );
};