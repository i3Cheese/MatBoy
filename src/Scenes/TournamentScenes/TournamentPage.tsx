import React, {FC} from "react";
import {Tournament} from "../../types/models";
import {useRouteMatch} from "react-router";
import PageHeader from "../../components/PageHeader";
import SimpleMenu from "../../components/SimpleMenu";
import {Box, BoxContainer, BoxTitle, DateSpan, InfoBox} from "../../components";
import {LeaguesBox} from "../../components/models/League/League";
import {useMenuItem} from "../../helpers/hooks";

export const TournamentPage: FC<{tour: Tournament}> = ({tour}) => {
    const {url} = useRouteMatch();
    return (
        <>
            <PageHeader>
                <PageHeader.Title>
                    {tour.title}
                </PageHeader.Title>
                <SimpleMenu>
                    <SimpleMenu.Link to={`${url}/team/new`}>подать заявку</SimpleMenu.Link>
                    {tour.manage_access && [
                        <SimpleMenu.Link to={`${url}/edit`}>редактировать</SimpleMenu.Link>,
                        <SimpleMenu.Link to={`${url}/console`}>управлять</SimpleMenu.Link>,
                        <SimpleMenu.Link to={`${url}/post/new`}>создать новость</SimpleMenu.Link>,
                    ]}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer covid>
                <LeaguesBox tourId={tour.id}/>
                <Box type="square">
                    <BoxTitle>
                        Информация
                    </BoxTitle>
                    <InfoBox>
                        <dd className="col-sm-8">Место проведения:</dd>
                        <dt className="col-sm-4">{tour.place}</dt>
                        <dd className="col-sm-8">Дата начала:</dd>
                        <dt className="col-sm-4"><DateSpan date={tour.start}/></dt>
                        <dd className="col-sm-8">Дата окончания:</dd>
                        <dt className="col-sm-4"><DateSpan date={tour.end}/></dt>
                    </InfoBox>
                </Box>
            </BoxContainer>
        </>
    );
}
