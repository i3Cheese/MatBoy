import React, {FC} from 'react';
import './Box.scss';
import {Container, ContainerProps} from "react-bootstrap";
import classnames from "classnames";

export interface BoxContainerProps extends ContainerProps {
    covid?: boolean,
    reverseWrap?: boolean
}

export const BoxContainer: FC<BoxContainerProps> = ({children, className, covid, fluid, reverseWrap, ...props}) => {
    if (fluid === undefined) {
        fluid = true;
    }
    return (
        <Container
            className={classnames(
                "box_container",
                covid && "box_container-covid",
                reverseWrap&&"box_container-reverseWrap",
                className)}
            fluid={fluid}
            {...props}>
            {children}
        </Container>
    );
}
// export default BoxContainer;
