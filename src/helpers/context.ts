import * as React from 'react';

export const MenuPriorityContext = React.createContext<number>(0);

export const useMenuPriorityContext = () => React.useContext(MenuPriorityContext);

