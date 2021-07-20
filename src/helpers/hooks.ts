import {useEffect} from "react";
import {addMenuItem, removeMenuItem} from "../actions";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../store";

export function useMenuItem(url: string, title: string) {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        addMenuItem(url, title)(dispatch);
        return () => {
            removeMenuItem(url, title)(dispatch);
        }
    })
}