import React, {FC} from "react";

const Main: FC = (props) => {
    return (
        <main role="main" className="container flex-shrink-0">
            {props.children}
        </main>
    );
}

export default Main;