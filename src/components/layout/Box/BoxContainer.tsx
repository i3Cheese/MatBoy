import React, {ComponentProps, FC} from 'react';
import './Box.scss';
import {Container, ContainerProps} from "react-bootstrap";

export interface BoxContainerProps extends ContainerProps {
    covid?: boolean,
}
export const BoxContainer: FC<BoxContainerProps> = ({children, className, covid, fluid, ...props}) => {
    if (fluid === undefined) {
        fluid = true;
    }
    return (
        <Container className={"box_container " + (covid?"box_container-covid ":"") + (className || "")} fluid={fluid} {...props}>
            {children}
        </Container>
    );
}
// export default BoxContainer;
