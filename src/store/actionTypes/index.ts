import AuthAction from "./auth.types.actions";
import MenuAction from "./menu.types.actions";

type AppAction = AuthAction | MenuAction;

export default AppAction;

export * from './auth.types.actions';
export * from './menu.types.actions';
