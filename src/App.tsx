import React, {FC} from "react";
import Header from "./components/Header";
import './App.scss';
import {useDispatch} from "react-redux";
import {AppAction} from "./store";
import {authActions} from "./actions";
import {Dispatch} from "redux";
import {Route, Switch} from "react-router";
import AuthScenes from "./Scenes/AuthScenes";

const App: FC = () => {
    const dispatch = useDispatch<Dispatch<AppAction>>();
    authActions.getCurrentUser()(dispatch);
    return (
        <Switch>
            <Route path={['/login', '/logout', '/registration']} component={AuthScenes}/>
             <Route path='*'>
                 <Header />
                 <Switch>
                 </Switch>
             </Route>
        </Switch>
    )
}

export default App;