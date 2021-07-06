import {configureStore } from '@reduxjs/toolkit'
import {authReducer} from "./reducers";

const store = configureStore({
    reducer: {
        auth: authReducer,
    }
});

import AppAction from './actionTypes';
export default store;
export { AppAction };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;