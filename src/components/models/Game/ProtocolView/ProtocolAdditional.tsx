import React, {FC} from 'react';
import {Controller} from 'react-hook-form';
import {Form} from "react-bootstrap";

import './ProtocolAdditional.scss';

interface ProtocolAdditionalBaseProps {
}

const ProtocolAdditionalBase: FC<ProtocolAdditionalBaseProps> = ({children}) => (
    <div className={"ProtocolAdditional"}>
        <label className={"ProtocolAdditional__label"}>
            Примечания:
        </label>
        {children}
    </div>
)

export const ProtocolAdditionalEdit: FC = () => (
    <ProtocolAdditionalBase>
        <Controller
            name={`additional`}
            render={({field, fieldState}) => (
                <Form.Control
                    as={"textarea"}
                    {...field}
                    isInvalid={fieldState.invalid}
                />
            )}/>
    </ProtocolAdditionalBase>
);

export const ProtocolAdditionalView: FC<{ additional: string }> = ({additional}) => (
    <>
        {additional &&
        <ProtocolAdditionalBase>
            <i className={"ProtocolAdditional__text"}>{additional}</i>
        </ProtocolAdditionalBase>
        }
    </>
);

