import React, {FC} from "react";
import {Route} from "react-router";
import {BoxContainer, SwitchWith404} from "../components";
import {LoginFormBox, RegistrationFormBox} from "../components";

const AuthScenes: FC = () => {
    return (
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
    );
}

export default AuthScenes;
