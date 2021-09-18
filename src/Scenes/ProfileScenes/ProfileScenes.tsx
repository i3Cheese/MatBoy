import React, {FC} from 'react';
import {Route, useParams, useRouteMatch} from "react-router";
import {ErrorHandler, LoaderPage, SwitchWith404} from "../../components";
import MenuItemComponent from "../../components/MenuItemComponent";
import {ProfilePage} from "./ProfilePage";
import {useUser} from "../../helpers/hooks";

const ProfileIdScenes: FC = () => {
    const {path} = useRouteMatch();
    const {userId: userIdString} = useParams<{userId: string}>();
    const userId = parseInt(userIdString);
    const [user, error] = useUser(userId)

    if (error) return <ErrorHandler error={error}/>
    if (user === null) return <LoaderPage/>
    return (
        <MenuItemComponent title={user.name}><SwitchWith404>
            <Route path={path} exact>
                <ProfilePage user={user}/>
            </Route>
        </SwitchWith404></MenuItemComponent>
    )
}

const ProfileScenes: FC = () => {
    const {path} = useRouteMatch();
    return (
        <SwitchWith404>
            <Route path={`${path}/:userId`} >
                <ProfileIdScenes/>
            </Route>
        </SwitchWith404>
    );
}

export default ProfileScenes;