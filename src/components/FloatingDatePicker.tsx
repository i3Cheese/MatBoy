import {Controller, FieldError} from "react-hook-form";
import React, {ComponentProps, FC} from "react";
import DatePicker from "react-datepicker";
import ru from 'date-fns/locale/ru';
import FormInput from "./FormInput";
import classnames from 'classnames';

export interface FloatingDatePickerProps extends ComponentProps<'div'>{
    control?: any,
    name: any,
    showTimeSelect?: boolean,
    label: string,
    error?: FieldError,
    showTime?: boolean,
    mb?: boolean,
}

const FloatingDatePicker: FC<FloatingDatePickerProps> = (props) => {
    const showTime = props.showTime || false;
    const datePickerProps = {
        locale: ru,
        wrapperClassName: classnames("w-100", props.className),
        showTimeSelect: props.showTime,
        dateFormat: showTime?"dd.MM.yyyy HH:mm":"dd.MM.yyyy",
    }
    return (
        <Controller
            control={props.control}
            name={props.name}
            render={({field}) => (
                <DatePicker
                    {...datePickerProps}
                    customInput={
                        <FormInput label={props.label} error={props.error} mb={props.mb}/>
                    }
                    {...field}
                    selected={field.value}
                />
            )}
        />
    );
}

export default FloatingDatePicker;