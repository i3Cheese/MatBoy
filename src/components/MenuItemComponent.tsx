import React, {FC} from 'react';
import {useMenuItem} from "../helpers/hooks";
import {useRouteMatch} from "react-router";
import {createMenuItem} from "../types/menu";
import {MenuPriorityContext, useMenuPriorityContext} from "../helpers/context";

interface MenuItemComponentProps {
    title: string,
}

const MenuItemComponent: FC<MenuItemComponentProps> = ({title, children}) => {
    const {url} = useRouteMatch();
    const priority = useMenuPriorityContext();
    useMenuItem(createMenuItem(priority, url, title));
    return <MenuPriorityContext.Provider value={priority + 1}>{children}</MenuPriorityContext.Provider>
}

export default MenuItemComponent;