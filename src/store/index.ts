import {configureStore } from '@reduxjs/toolkit'
import {authReducer} from "./reducers";

const store = configureStore({
    reducer: {
        auth: authReducer,
    }
});

import AppAction from './actionTypes';
export { AppAction };