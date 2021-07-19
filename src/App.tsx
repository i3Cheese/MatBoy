import React, {FC, useEffect} from "react";
import './App.scss';
import {useDispatch} from "react-redux";
import {AppAction} from "./store";
import {authActions} from "./actions";
import {Dispatch} from "redux";
import IndexScenes from "./Scenes/IndexScenes";

const App: FC = () => {
    const dispatch = useDispatch<Dispatch<AppAction>>();
    useEffect(()=>{
        authActions.getCurrentUser()(dispatch)
    },[dispatch])
    return (
        <IndexScenes/>
    )
}

export default App;