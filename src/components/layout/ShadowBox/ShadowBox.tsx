import React, {ComponentProps, FC} from "react";
import './ShadowBox.scss'

export const ShadowBox: FC<ComponentProps<'div'>> = ({children, className,...props}) => {
    return (
        <div className={"shadow_box" + (className || "")} {...props}>
            {children}
        </div>
    );
}