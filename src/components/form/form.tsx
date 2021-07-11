import React, {ComponentProps, FC} from "react";

export const Fieldset: FC<ComponentProps<'div'>> = ({children, className,...props}) => {
    return (
        <div className={"free_fieldset"+ (className || "")} {...props}>
            {children}
        </div>
    );
}