import React, {FC} from 'react';
import {Layout} from "../../components";
import {ShadowBox} from "../../components";
import TournamentForm from "../../components/models/Tournament/TournamentForm";
import tournamentService, {ITournamentFormRequest} from "../../services/tournament.services";
import {Tournament} from "../../types/models";
import {history} from "../../helpers";

const NewTournament: FC = () => {
    const handleSubmit = (data: ITournamentFormRequest) =>
        tournamentService.postNew(data).then(
            (tour: Tournament) => {
                console.log(tour);
                history.push(tour.link);
            });
    return (
        <Layout size="middle">
            <ShadowBox>
                <TournamentForm onSubmit={handleSubmit}/>
            </ShadowBox>
        </Layout>
    );
}

export default NewTournament;
