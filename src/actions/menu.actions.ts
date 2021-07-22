import {AppDispatch} from '../store';
import {MenuItem} from "../types/menu";

export function addMenuItem(item: MenuItem){
    return (dispatch: AppDispatch) => {dispatch({
        type: "ADD_MENU",
        item,
    })}
}

export function removeMenuItem(item: MenuItem) {
    return (dispatch: AppDispatch) => {dispatch({
        type: "REMOVE_MENU",
        item,
    })}
}
