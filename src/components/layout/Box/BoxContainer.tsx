import React, {ComponentProps, FC} from 'react';
import './Box.scss';

export interface BoxContainerProps extends ComponentProps<'div'> {
    covid?: boolean,
}
export const BoxContainer: FC<BoxContainerProps> = ({children, className, covid, ...props}) => {
    return (
        <div className={"box_container " + (covid?"box_container-covid ":"") + (className || "")} {...props}>
            {children}
        </div>
    );
}
// export default BoxContainer;
