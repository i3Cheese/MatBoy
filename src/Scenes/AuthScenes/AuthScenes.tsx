import React, {FC} from "react";
import {Route, Switch} from "react-router";
import './AuthScenes.scss'
import {BoxContainer} from "../../components";
import {LoginFormBox, RegistrationFormBox} from "../../components/models/User";

const AuthScenes: FC = () => {
    return (
        <BoxContainer>
            <Switch>
                <Route path="/login">
                    <LoginFormBox/>
                </Route>
                <Route path="/registration">
                    <RegistrationFormBox/>
                </Route>
            </Switch>
        </BoxContainer>
    );
}

export default AuthScenes;
