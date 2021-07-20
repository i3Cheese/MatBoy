import React, {FC} from "react";
import {Tournament} from "../../types/models";
import {useRouteMatch} from "react-router";
import PageHeader from "../../components/PageHeader";
import SimpleMenu from "../../components/SimpleMenu";
import {Box, BoxContainer, DateSpan, InfoBox} from "../../components";
import {LeaguesBox} from "../../components/models/League/League";
import {useMenuItem} from "../../helpers/hooks";

export const TournamentPage: FC<{tour: Tournament}> = ({tour}) => {
    const {url} = useRouteMatch();
    useMenuItem(url, tour.title);
    return (
        <>
            <PageHeader>
                <PageHeader.Title>
                    {tour.title}
                </PageHeader.Title>
                <SimpleMenu>
                    <SimpleMenu.Link to={`${url}/team/new`}>подать заявку</SimpleMenu.Link>
                    {tour.edit_access && [
                        <SimpleMenu.Link to={`${url}/edit`}>редактировать</SimpleMenu.Link>,
                        <SimpleMenu.Link to={`${url}/console`}>управлять</SimpleMenu.Link>,
                        <SimpleMenu.Link to={`${url}/post/new`}>создать новость</SimpleMenu.Link>,
                    ]}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer covid>
                <LeaguesBox tourId={tour.id}/>
                <Box type="square">
                    <InfoBox>
                        <dd className="col-sm-6">Место проведения:</dd>
                        <dt className="col-sm-6">{tour.place}</dt>
                        <dd className="col-sm-6">Дата начала:</dd>
                        <dt className="col-sm-6"><DateSpan date={tour.start}/></dt>
                        <dd className="col-sm-6">Дата окончания:</dd>
                        <dt className="col-sm-6"><DateSpan date={tour.end}/></dt>
                    </InfoBox>
                </Box>
            </BoxContainer>
        </>
    );
}
