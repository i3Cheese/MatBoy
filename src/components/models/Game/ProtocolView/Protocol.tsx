import React, {FC, ReactNode} from 'react';
import {Box, BoxContainer} from "../../../layout";


import "./Protocol.scss";

export const ProtocolPage: FC = ({children, ...props}) => (
    <div {...props} className={"ProtocolPage"}>
        {children}
    </div>
);


export const ProtocolBox: FC = ({children, ...props}) => (
    <Box {...props} className={"ProtocolBox"}>
        {children}
    </Box>
);

