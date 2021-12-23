import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from './store';
import App from "./App";
import './index.scss';
import { setLocale } from "yup";
import { ru } from "./helpers/yupLocales";
import './helpers/axiosSetup';
import { ErrorBoundary } from "./components";
setLocale(ru);
ReactDOM.render(React.createElement(React.StrictMode, null,
    React.createElement(ErrorBoundary, null,
        React.createElement(Provider, { store: store },
            React.createElement(BrowserRouter, null,
                React.createElement(App, null))))), document.getElementById("root"));
