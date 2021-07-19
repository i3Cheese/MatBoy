import React, {ComponentProps, FC} from 'react';
import {Link, LinkProps} from "react-router-dom";
import './DivLink.scss'



const DivLink: FC<LinkProps> = ({children, className, ...props}) => {
    return (
        <div className={"div_link centered_block " + className || ""}>
            <Link {...props}><span></span></Link>
            {children}
        </div>
    )
}
export default DivLink;
