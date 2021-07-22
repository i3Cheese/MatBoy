import {Action} from "redux";
import {MenuItem} from "../../types/menu";

export interface AddMenuAction extends Action {
    type: "ADD_MENU",
    item: MenuItem,
}

export interface RemoveMenuAction extends Action{
    type: "REMOVE_MENU",
    item: MenuItem,
}

type MenuAction = AddMenuAction | RemoveMenuAction;

export default MenuAction;