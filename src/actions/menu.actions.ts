import {AppDispatch} from '../store';

export function addMenuItem(url: string, title: string){
    return (dispatch: AppDispatch) => {dispatch({
        type: "ADD_MENU",
        url,
        title,
    })}
}

export function removeMenuItem(url: string, title: string) {
    return (dispatch: AppDispatch) => {dispatch({
        type: "REMOVE_MENU",
        url,
        title,
    })}
}
