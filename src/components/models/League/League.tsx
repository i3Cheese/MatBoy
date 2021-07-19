import React, {FC, useEffect, useState} from "react";
import {League} from "../../../types/models";
import DivLink from "../../layout/DivLink";
import {Box, BoxTitle} from "../../layout";
import Loader from "react-loader-spinner";
import {leagueServices} from "../../../services";

export const LeagueItem: FC<{ league: League }> = ({league}) => {
    return (
        <DivLink to={`/tournament/${league.tournament.id}/league/${league.id}`}>
            <h2 className="item_title">{league.title}</h2>
        </DivLink>
    )
};

export const LeaguesBox: FC<{tourId: number}> = ({tourId}) => {
    const [leagues, setLeagues] = useState<League[] | null>(null);
    useEffect(() => {
        leagueServices.getLeagues(tourId).then((leagues) => setLeagues(leagues));
    }, [tourId])
    return (
        <Box size="large">
            <BoxTitle>
                Лиги
            </BoxTitle>
            {
                leagues?.map((league) => (
                    <LeagueItem league={league} key={league.id}/>
                ))
            }
            {leagues === null && <div className="centered_block"><Loader
                type="Rings"
                color="#000000"
                height={100}
                width={100}
            /></div>}
        </Box>
    )
}
