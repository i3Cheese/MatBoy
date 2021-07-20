import React from "react";
import {FC} from "react";
import Header from "./Header";
import {Main} from "./layout";

const PageWrapper: FC = ({children}) => (
    <>
        <Header/>
        <Main>
            {children}
        </Main>
    </>
)

export default PageWrapper;