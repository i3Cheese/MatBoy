import React, {FC} from "react";
import {Route, Switch} from "react-router";
import LoginScene from "./LoginScene";
import './AuthScenes.scss'
import {Layout} from "../../components";

const AuthScenes: FC = () => {
    return (
        <Layout size="thin">
            <Switch>
                <Route path="/login" component={LoginScene}/>
                {/*<Route path="/registration" component={RegistrationForm} />*/}
            </Switch>
        </Layout>
    );
}

export default AuthScenes;
