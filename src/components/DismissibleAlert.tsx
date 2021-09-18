import React, {FC, useState} from 'react';
import {Alert, AlertProps} from "react-bootstrap";


const DismissibleAlert: FC<AlertProps> = ({children, show: defShow, ...props}) => {
    const [show, setShow] = useState(defShow || false);
    return <Alert {...props} show={show} dismissible onClose={()=>setShow(false)}>{children}</Alert>
}

export default DismissibleAlert;