import React, {FC} from 'react';
import {Layout} from "../../components";
import {ShadowBox} from "../../components";
import TournamentForm from "../../components/models/Tournament/TournamentForm";
import tournamentService, {ITournamentFormRequest} from "../../services/tournament.services";
import {Tournament} from "../../types/models";
import {history} from "../../helpers";
import Loader from "react-loader-spinner";

const EditTournament: FC<{tour: Tournament, setTour: (tour: Tournament) => void}> = ({tour, setTour}) => {
    const handleSubmit = (data: ITournamentFormRequest) =>
        tournamentService.edit(tour.id, data).then(
            (tour: Tournament) => {
                setTour(tour);
                history.push(`/tournament/${tour.id}`);
            });
    return (
        <Layout size="middle">
            <ShadowBox>
                <TournamentForm onSubmit={handleSubmit} tour={tour}/>
            </ShadowBox>
        </Layout>
    );
}

export default EditTournament;