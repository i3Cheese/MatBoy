import React, {FC} from 'react';
import {Tournament} from "../../types/models";
import Loader from "react-loader-spinner";
import PageHeader from "../../components/PageHeader";
import SimpleMenu from "../../components/SimpleMenu";
import { Link } from 'react-router-dom';
import {Box, BoxContainer, DateSpan, InfoInBox} from "../../components";
import {LeaguesBox} from "../../components/models/League/League";

const TournamentId: FC<{tour: Tournament | null}> = ({tour}) => {
    if (tour === null) {
        return <Loader type="Circles"/>
    }
    return (
        <>
            <PageHeader>
                <PageHeader.Title>
                    {tour.title}
                </PageHeader.Title>
                <SimpleMenu>
                    <Link to={`/tournament${tour.id}/team_request`}>подать заявку</Link>
                    {tour.edit_access && [
                        <Link to={`/tournament/${tour.id}/edit`}>редактировать</Link>,
                        <Link to={`/tournament/${tour.id}/console`}>управлять</Link>,
                        <Link to={`/tournament/${tour.id}/post/new`}>создать новость</Link>,
                    ]}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer covid>
                <LeaguesBox tourId={tour.id}/>
                <Box type="square">
                    <InfoInBox>
                        <dd className="col-sm-6">Место проведения:</dd>
                        <dt className="col-sm-6">{tour.place}</dt>
                        <dd className="col-sm-6">Дата начала:</dd>
                        <dt className="col-sm-6"><DateSpan date={tour.start}/></dt>
                        <dd className="col-sm-6">Дата окончания:</dd>
                        <dt className="col-sm-6"><DateSpan date={tour.end}/></dt>
                    </InfoInBox>
                </Box>
            </BoxContainer>
        </>
    );
}

export default TournamentId;
