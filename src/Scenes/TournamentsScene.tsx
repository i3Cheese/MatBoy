import React, {FC} from 'react';
import {BoxContainer, Layout} from "../components";
import {TournamentBox} from "../components/models/Tournament/Tournament";

const TournamentsScene: FC = () => {
    return (
        <Layout>
            <BoxContainer>
                <TournamentBox />
            </BoxContainer>
        </Layout>
    )
};
export default TournamentsScene;