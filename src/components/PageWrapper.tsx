import React from "react";
import {FC} from "react";
import Header, {MenuList} from "./Header";
import {Main} from "./layout";

const PageWrapper: FC<{menu?: MenuList}> = ({menu, children}) => (
    <>
        <Header menu={menu}/>
        <Main>
            {children}
        </Main>
    </>
)

export default PageWrapper;