import React, {FC} from "react";
import {Route} from "react-router";
import {BoxContainer, Main, SwitchWith404} from "../components";
import {LoginFormBox, RegistrationFormBox} from "../components";
import PageWrapper from "../components/PageWrapper";

const AuthScenes: FC = () => {
    return (
        <Main>
            <BoxContainer>
                <SwitchWith404>
                    <Route path="/login">
                        <LoginFormBox/>
                    </Route>
                    <Route path="/registration">
                        <RegistrationFormBox/>
                    </Route>
                </SwitchWith404>
            </BoxContainer>
        </Main>
    );
}

export default AuthScenes;
