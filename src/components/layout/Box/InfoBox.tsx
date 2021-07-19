import React, {ComponentProps, FC} from "react";

const RawInfoInBox: FC<ComponentProps<'dl'>> = ({className, children, ...props}) => (
    <dl className={'row info_in_box' + (className || "")} {...props}>
        {children}
    </dl>
)


export const InfoBox = Object.assign(RawInfoInBox, {

})
export default InfoBox;
