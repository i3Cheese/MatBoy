import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import store from './store';
import {history} from "./helpers";
import {Router} from "react-router";

import App from "./App";
import 'bootstrap/scss/bootstrap.scss';
import './index.scss'

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Router history={history}>
                <App/>
            </Router>
        </Provider>
    </React.StrictMode>,
    document.getElementById("root")
);
