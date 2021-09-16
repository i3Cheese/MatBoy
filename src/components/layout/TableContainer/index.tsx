import React, {ComponentProps, FC} from 'react';
import classnames from "classnames";

import './TableContainer.scss';

export interface TableContainerProps extends ComponentProps<'div'>{}

const TableContainer: FC<TableContainerProps> = ({children, className, ...props}) => (
    <div className={classnames('TableContainer', className)} {...props}>
        {children}
    </div>
)

export default TableContainer;
