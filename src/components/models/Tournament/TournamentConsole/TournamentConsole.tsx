import React, {FC, useCallback, useRef, useState} from 'react';
import {League, Team, Tournament} from "../../../../types/models";
import {useLeagues, useTeams} from "../../../../helpers/hooks";
import {LoaderPage} from "../../../Loader";
import {Accordion,} from "react-bootstrap";
import {BoxContainer, Box, BoxTitle} from "../../../layout";
import {
    AcceptTeamCallback,
    DeclineTeamCallback,
    EditableTeamConsoleItem, RestoreTeamCallback,
    TeamCallbacks
} from "../../Team/TeamConsoleItem";
import {DeleteLeagueCallback, EditableLeagueConsoleItem, EditLeagueCallback} from "../../League/LeagueConsoleItem";
import {LeagueForm, LeagueFormData} from "../../League/LeagueForm";
import {leagueServices, teamServices} from "../../../../services";
import produce from "immer";
import {sortTeams} from "../../../../helpers";


export interface TournamentConsoleProps {
    tour: Tournament,
}

const TournamentConsole: FC<TournamentConsoleProps> = ({tour}) => {
    const [leagues, setLeagues] = useLeagues(tour.id);

    const handleAddLeague = useCallback((data: LeagueFormData) => (
        leagueServices.addLeague(data, tour.id).then(
            (league) => {
                setLeagues(produce(leagues, (draft) => {
                    if (draft !== null)
                        draft.push(league);
                }));
                return league;
            }
        )
    ), [setLeagues, leagues, tour]);

    const handleEditLeague = useCallback<EditLeagueCallback>((data: LeagueFormData, leagueId) => (
        leagueServices.changeLeague(data, leagueId).then(
            (league) => {
                setLeagues(produce(leagues, (draft) => {
                    if (draft === null) return;
                    const i = draft.findIndex(l => l.id === leagueId);
                    if (i >= 0) {
                        draft[i] = league;
                    }
                }));
                return league;
            }
        )
    ), [setLeagues, leagues]);
    const handleDeleteLeague = useCallback<DeleteLeagueCallback>((leagueId) => (
        leagueServices.deleteLeague(leagueId).then(
            () => {
                setLeagues(produce(leagues, (draft) => {
                    if (draft === null) return;
                    const i = draft.findIndex(l => l.id === leagueId);
                    draft.splice(i);
                }));
                refreshTeams();
            }
        )
    ), [setLeagues, leagues]);


    const [teams, setTeams, refreshTeams] = useTeams(tour.id);

    const editTeam = (team: Team) => {
        setTeams(sortTeams(produce(teams as Team[], draft => {
            const i = draft.findIndex(l => l.id === team.id);
            if (i >= 0) {
                draft[i] = team;
            }
        })));
        return team;
    };
    const teamCallbacks = {
        onAccept: useCallback<AcceptTeamCallback>((...args) => (
            teamServices.acceptTeam(...args).then(editTeam)
        ), [setTeams, teams]),
        onDecline: useCallback<DeclineTeamCallback>((...args) => (
            teamServices.declineTeam(...args).then(editTeam)
        ), [setTeams, teams]),
        onRestore: useCallback<RestoreTeamCallback>((...args) => (
            teamServices.restoreTeam(...args).then(editTeam)
        ), [setTeams, teams]),
    }

    if (leagues === null || teams === null)
        return <LoaderPage/>
    else {
        return (
            <BoxContainer covid>
                <TeamList teams={teams} leagues={leagues} {...teamCallbacks}/>
                <LeagueList teams={teams} leagues={leagues} onAddLeague={handleAddLeague}
                            onEditLeague={handleEditLeague}
                            onDeleteLeague={handleDeleteLeague}
                />
            </BoxContainer>
        )
    }
}

export default TournamentConsole;

interface TeamListProps extends TeamCallbacks {
    teams: Team[],
    leagues: League[],
}

const TeamList: FC<TeamListProps> = ({children, teams, leagues, ...callbacks}) => (
    <Box size="middle">
        <BoxTitle>
            Команды
        </BoxTitle>
        <Accordion>{teams.map((team) => (
            <EditableTeamConsoleItem team={team} leagues={leagues} key={team.id} {...callbacks}/>
        ))}</Accordion>
    </Box>
)

interface LeagueListProps {
    teams: Team[],
    leagues: League[],
    onAddLeague: (data: LeagueFormData) => Promise<League>,
    onEditLeague: EditLeagueCallback,
    onDeleteLeague: DeleteLeagueCallback,
}

const LeagueList: FC<LeagueListProps> = (
    {teams, leagues, onAddLeague, onEditLeague, onDeleteLeague}
) => {
    const accordionRef = useRef(null);
    const [defaultActiveKey, setDefaultActiveKey] = useState("league#new")
    const handleAddLeague = useCallback(data => (
        onAddLeague(data).then((league) => {
            if (accordionRef.current !== null) { // @ts-ignore
                accordionRef.current.click();
            }
            setDefaultActiveKey(`league#${league.id}`);
            return league;
        })
    ), [onAddLeague, accordionRef]);
    return (
        <Box size="middle">
            <BoxTitle>
                Лиги
            </BoxTitle>
            <Accordion defaultActiveKey={defaultActiveKey}>
                {leagues.map((league) => (
                    <EditableLeagueConsoleItem key={league.id}
                                               league={league}
                                               teams={teams}
                                               onEditLeague={onEditLeague}
                                               onDeleteLeague={onDeleteLeague}
                    />
                ))}
                <Accordion.Item eventKey="league#new" className="border-success">
                    <h2 className="accordion-header">
                        <Accordion.Button ref={accordionRef}>
                            Новая лига
                        </Accordion.Button>
                    </h2>
                    <Accordion.Body className="p-0">
                        <LeagueForm onSubmit={handleAddLeague}/>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Box>
    );
}
