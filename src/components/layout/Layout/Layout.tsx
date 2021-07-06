import React, {ComponentProps, FC} from "react";
import './Layout.scss';

interface LayoutProps extends ComponentProps<FC>{
    size?: "middle" | "thin"
}

const Layout: FC<LayoutProps> = (props) => {
    return (
        <div className="layout">
            <div className={`layout__page ${props.size && `layout__page-${props.size}`}`}>
                {props.children}
            </div>
        </div>
    )
}

export default Layout;