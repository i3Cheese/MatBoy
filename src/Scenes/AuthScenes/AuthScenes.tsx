import React, {FC} from "react";
import {Route, Switch} from "react-router";
import LoginScene from "./LoginScene";
import './AuthScenes.scss'
import {BoxContainer} from "../../components";
import {RegistrationFormBox} from "../../components/models/User";

const AuthScenes: FC = () => {
    return (
        <Switch>
            <Route path="/login" component={LoginScene}/>
            <Route path="/registration">
                <BoxContainer>
                    <RegistrationFormBox/>
                </BoxContainer>
            </Route>
        </Switch>
    );
}

export default AuthScenes;
