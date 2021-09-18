import React, {useMemo} from 'react';
import {FloatingLabel, FloatingLabelProps, Form, FormControlProps} from "react-bootstrap";
import {FieldError} from 'react-hook-form';
import classnames from "classnames";


export interface  FormInputProps extends FormControlProps {
    label: FloatingLabelProps['label'],
    error?: FieldError | undefined,
    inputClassName?: string,
    customInput?: React.ReactElement,
    name?: string,
    mb?: boolean,
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>((props, ref) => {
    const customInput = useMemo(() => React.cloneElement(props.customInput || <Form.Control/>, {
        ref: ref,
        name: props.name,
        type: props.type,
        value: props.value,
        onBlur: props.onBlur,
        onChange: props.onChange,
        onClick: props.onClick,
        onFocus: props.onFocus,
        onKeyDown: props.onKeyDown,
        id: props.id,
        placeholder: props.placeholder || props.label,
        disabled: props.disabled,
        className: props.inputClassName,
        title: props.title,
        readOnly: props.readOnly,
        tabIndex: props.tabIndex,
        isInvalid: props.error !== undefined,
        "aria-describedby": props["aria-describedby"],
        "aria-invalid": props["aria-invalid"],
        "aria-labelledby": props["aria-labelledby"],
        "aria-required": props["aria-required"],
    }), [props])
    return (
        <FloatingLabel label={props.label} className={classnames(props.className, props.mb?'mb-3':'')}>
            {customInput}
            <Form.Control.Feedback type="invalid">
                {props.error?.message}
            </Form.Control.Feedback>
        </FloatingLabel>
    );
});

export default FormInput;
