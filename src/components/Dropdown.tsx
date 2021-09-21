import React, {FC} from 'react';
import {ThreeDots} from "react-bootstrap-icons";
import DropdownToggle, {DropdownToggleProps} from "react-bootstrap/DropdownToggle";
import DropdownItem from "react-bootstrap/DropdownItem";
import {Dropdown, DropdownProps} from "react-bootstrap";

import './Dropdown.scss'

export const ThreeDotsToggle: FC<DropdownToggleProps> = (props) => (
    <DropdownToggle as={'span'} className={"ThreeDotsToggle"} {...props}><ThreeDots/></DropdownToggle>
)

export const ThreeDotsDropdown: FC<DropdownProps> = ({children, "aria-label": ariaLabel, ...props}) => (
    <Dropdown {...props}>
        <ThreeDotsToggle aria-label={ariaLabel}/>
        <Dropdown.Menu>
            {children}
        </Dropdown.Menu>
    </Dropdown>
)

export const MBDropdownItem: typeof DropdownItem = React.forwardRef(
    ({as='button', ...props}, ref) => <DropdownItem as={as} {...props} ref={ref}/>
);
