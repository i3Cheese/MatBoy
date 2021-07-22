import AppAction from "../actionTypes";
import produce from "immer";
import {MenuItem} from "../../types/menu";

export type MenuState = {items: MenuItem[]}

const initialState: MenuState = {items: []}

export function menuReducer(state: MenuState = initialState, action: AppAction): MenuState {
    switch (action.type) {
        case "ADD_MENU":
            return produce(state, (d) => {
                d.items[action.item.priority] = action.item;
            });
        case "REMOVE_MENU":
            return produce(state, (d) => {
                delete d.items[action.item.priority];
            });
        default:
            return state
    }
}
