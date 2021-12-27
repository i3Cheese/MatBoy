import React, {FC} from "react";
import {Tournament} from "../../types/models";
import {useRouteMatch} from "react-router";
import PageHeader from "../../components/PageHeader";
import SimpleMenu from "../../components/SimpleMenu";
import {Box, BoxContainer, BoxTitle, DateSpan, InfoBox, PostsList} from "../../components";
import {LeaguesBox} from "../../components";

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
                    {tour.manage_access && <>
                        <SimpleMenu.Link to={`${url}/edit`}>редактировать</SimpleMenu.Link>
                        <SimpleMenu.Link to={`${url}/console`}>управлять</SimpleMenu.Link>
                        <SimpleMenu.Link to={`${url}/post/new`}>создать новость</SimpleMenu.Link>
                        <SimpleMenu.Link to={`${url}/post/archived`}>архив</SimpleMenu.Link>
                    </>}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer covid reverseWrap>
                {/*<LeaguesBox tourId={tour.id}/>*/}
                {/* TODO: раскоментить */}
                <Box type="square">
                    <BoxTitle>
                        Информация
                    </BoxTitle>
                    <InfoBox>
                        <dd className="col-sm-7">Место проведения:</dd>
                        <dt className="col-sm-5">{tour.place}</dt>
                        <dd className="col-sm-7">Дата начала:</dd>
                        <dt className="col-sm-5"><DateSpan date={tour.start_time}/></dt>
                        <dd className="col-sm-7">Дата окончания:</dd>
                        <dt className="col-sm-5"><DateSpan date={tour.end_time}/></dt>
                    </InfoBox>
                </Box>
            </BoxContainer>
            <PostsList tourId={tour.id}/>
        </>
    );
}
