import React, {FC} from "react";
import {User} from "../../types/models";
import {BoxContainer, TeamsBox, UserInfoBox} from "../../components";
import {useTeams} from "../../helpers/hooks";

export const ProfilePage: FC<{user: User}> = ({user}) => {
    const [teams] = useTeams(undefined, undefined, user.id);
    return (
        <>
            <BoxContainer>
                <TeamsBox teams={teams} size={undefined}/>
                <UserInfoBox user={user}/>
            </BoxContainer>
        </>
    );
}