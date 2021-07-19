import AppAction from "../actionTypes";
import produce from "immer";

export type MenuState = {items: [string, string][]}

const initialState: MenuState = {items: []}

export function menuReduces(state: MenuState = initialState, action: AppAction): MenuState {
    switch (action.type) {
        case "ADD_MENU":
            return produce(state, (d) => {
                d.items.push([action.url, action.title]);
            });
        case "REMOVE_MENU":
            return produce(state, (d) => {
                d.items = d.items.slice(0, d.items.indexOf([action.url, action.title]));
            });
        default:
            return state
    }
}
