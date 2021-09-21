import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";

import store from './store';

import App from "./App";
import './index.scss'
import {setLocale} from "yup";
import {ru} from "./helpers/yupLocales";
import './helpers/axiosSetup';
import {ErrorBoundary} from "./components";

setLocale(ru);

ReactDOM.render(
    <React.StrictMode>
        <ErrorBoundary><Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider></ErrorBoundary>
    </React.StrictMode>,
    document.getElementById("root")
);
