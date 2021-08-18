import React, {FC, useEffect, useState} from 'react';
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import {User} from "../../types/models";
import {LoaderPage} from "../../components";
import MenuItemComponent from "../../components/MenuItemComponent";
import {ProfilePage} from "./ProfilePage";
import {userServices} from "../../services";

const ProfileIdScenes: FC = () => {
    const {path} = useRouteMatch();
    const {userId: userIdString} = useParams<{userId: string}>();
    const userId = parseInt(userIdString);
    const [user, setUser
    ] = useState<User | null>(null);
    useEffect(()=>{
        userServices.get(userId).then(setUser);
    }, [userId]);
    if (user === null) return <LoaderPage/>
    return (
        <MenuItemComponent title={user.name}><Switch>
            <Route path={path} exact>
                <ProfilePage user={user}/>
            </Route>
        </Switch></MenuItemComponent>
    )
}

const ProfileScenes: FC = () => {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/:userId`} >
                <ProfileIdScenes/>
            </Route>
        </Switch>
    );
}

export default ProfileScenes;