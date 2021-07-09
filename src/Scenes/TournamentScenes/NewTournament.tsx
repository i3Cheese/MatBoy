import React, {Component, FC} from 'react';
import {Layout} from "../../components";
import {ShadowBox} from "../../components";
import TournamentForm, {
    TournamentFormReturn
} from "../../components/models/Tournament/TournamentForm";

const NewTournament: FC = () => {
    const handleSubmit = (data: TournamentFormReturn) => {
        fetch(
            '/api/new_tournament',

        )
    };
    return (
        <Layout size="middle">
            <ShadowBox>
                <TournamentForm onSubmit={(data) => fetch('/api/new_tournament')} />
            </ShadowBox>
        </Layout>
    );
}

export default NewTournament;
