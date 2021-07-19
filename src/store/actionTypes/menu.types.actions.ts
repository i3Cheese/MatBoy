import {Action} from "redux";

export interface AddMenuAction extends Action {
    type: "ADD_MENU",
    url: string,
    title: string,
}

export interface RemoveMenuAction extends Action{
    type: "REMOVE_MENU",
    url: string,
    title: string,
}

type MenuAction = AddMenuAction | RemoveMenuAction;

export default MenuAction;