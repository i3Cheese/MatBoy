import React, {ComponentProps, FC} from "react";
import './Layout.scss';

export interface LayoutProps extends ComponentProps<FC>{
    size?: "middle" | "thin"
}

const Layout: FC<LayoutProps> = (props) => {
    return (
        <div className={`layout ${props.size && `layout-${props.size}`}`}>
            {props.children}
        </div>
    )
}

export default Layout;