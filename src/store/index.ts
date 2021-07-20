import {configureStore } from '@reduxjs/toolkit'
import {authReducer, menuReducer} from "./reducers";
import AppAction from './actionTypes';

const store = configureStore({
    reducer: {
        auth: authReducer,
        menu: menuReducer,
    }
});

export default store;
export { AppAction };
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;