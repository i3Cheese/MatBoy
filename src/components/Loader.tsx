import React from "react";
import {FC} from "react";
import Loader from "react-loader-spinner";
import {Box, BoxContainer, BoxProps} from "./layout";


export const AppLoader: FC = (children) => (
    // @ts-ignore
    <Loader className="centered_block" type="Circles" color="#101010">{children}</Loader>
)

export interface LoaderBoxProps extends BoxProps {

}

export const LoaderBox: FC<BoxProps> = ({className, ...props}) => (
    <Box className={className || ""} {...props}>
        <AppLoader />
    </Box>
)

export const LoaderPage: FC = () => (
    <BoxContainer><AppLoader/></BoxContainer>
)

