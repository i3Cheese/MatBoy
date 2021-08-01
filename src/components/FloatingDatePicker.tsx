import {Controller, FieldError} from "react-hook-form";
import React, {ComponentProps, FC} from "react";
import DatePicker from "react-datepicker";
import {FloatingLabel, Form} from "react-bootstrap";
import ru from 'date-fns/locale/ru';

export interface FloatingDatePickerProps extends ComponentProps<'div'>{
    control?: any,
    name: any,
    showTimeSelect?: boolean,
    label: string,
    error?: FieldError,
}

const FloatingDatePicker: FC<FloatingDatePickerProps> = ({label, control, name, error, className}) => (
    <Controller
        control={control}
        name={name}
        render={({field}) => (
            <DatePicker
                showTimeSelect
                customInput={
                    <FloatingLabel label={label}>
                        <Form.Control {...field}
                                      value={field.value?.toLocaleString() || ""}
                                      isInvalid={error !== undefined}
                        />
                        <Form.Control.Feedback>
                            {error?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                }
                locale={ru}
                wrapperClassName={"w-100 " + className || ""}
                selected={field.value}
                onChange={(date) => {field.onChange(date); console.log(field.value);}}
            />
        )}
    />
)

export default FloatingDatePicker;