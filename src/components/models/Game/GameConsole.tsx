import React, {FC, useCallback, useEffect, useState} from 'react';
import {Game} from "../../../types/models";
import {CaptainTaskEdit, GameTable, GameTableRoundEdit} from "./ProtocolView";
import {TeamProtocolDataEdit, TeamProtocolDataViewContainer} from "./ProtocolView";
import {protocolObject} from "../../../helpers/yupFields";
import {useFieldArray, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, ButtonGroup, Spinner} from "react-bootstrap";
import {FormProvider} from 'react-hook-form';
import {ProtocolBox, ProtocolPage} from "./ProtocolView/Protocol";
import {ProtocolToolbarEdit} from "./ProtocolView/ProtocolToolbar";
import {ProtocolAdditionalEdit} from "./ProtocolView/ProtocolAdditional";
import {gameServices} from "../../../services";
import {GameHeaderEdit} from "./GameHeader";
import {useHistory} from "react-router";
import {gameLink} from "../../../helpers/links";
import DismissibleAlert from "../../DismissibleAlert";

export interface GameConsoleProps {
    game: Game,
    setGame: (game: Game) => any,
}

function useProtocol(game: Game, setGame: (game: Game) => any) {
    const gameId = game.id;
    // const [game, setGame] = useState(initialGame);
    const [status, setStatus] = useState<"saved" | "failed" | "saving">("saved");
    const [savedTime, setSavedTime] = useState(new Date());
    const history = useHistory();
    const setAndReturn = (game: Game) => {
        setStatus("saved");
        setSavedTime(new Date());
        setGame(game);
        return game;
    }
    const failAndReturn = (e: any) => {setStatus("failed"); console.log(e); return Promise.reject(e);}

    const sendProtocol = useCallback((data: any) => {
        setStatus("saving");
        return gameServices.editProtocol(data, gameId).then(setAndReturn, failAndReturn);
    }, [setStatus, gameId]);
    const startGame = useCallback((data) => {
        sendProtocol(data).then(_g => gameServices.startGame(gameId).then(setAndReturn, failAndReturn));
    }, [gameId]);
    const finishGame = useCallback((data) => {
        sendProtocol(data).then(_g => gameServices.finishGame(gameId).then(
            g=>{setAndReturn(g); history.push(gameLink(g)); return g;}, failAndReturn));
    }, [gameId]);
    const restoreGame = useCallback((data) => {
        sendProtocol(data).then(_g => gameServices.restoreGame(gameId).then(setAndReturn, failAndReturn));
    }, [gameId]);
    return {game, status, savedTime, sendProtocol, startGame, finishGame, restoreGame};
}


const GameConsole: FC<GameConsoleProps> = ({game: initialGame, setGame}) => {
    const {game, status, sendProtocol, savedTime, startGame, finishGame, restoreGame} = useProtocol(initialGame, setGame);
    const validationSchema = protocolObject(game);
    const formMethods = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: game.protocol,
        mode: "all",
    });
    const {control, handleSubmit} = formMethods;
    const {fields: rounds, append: appendRound, remove: removeRound} = useFieldArray({
        control,
        name: "rounds",
    });
    const appendDefaultRound = useCallback(() => appendRound({
        team1_data: {
            points: 0,
            stars: 0,
            players: [],
        },
        team2_data: {
            points: 0,
            stars: 0,
            players: [],
        },
        problem: 0,
        call_type: 1,
        additional: "",
    }), [appendRound]);
    const removeLastRound = useCallback(() => removeRound(rounds.length - 1),
        [removeRound, rounds.length]);
    useEffect(() => {
        if (rounds.length == 0 && game.status == 'started') appendDefaultRound();
    }, [rounds.length]);

    const [swapped, setSwapped] = useState(false);
    return (
        <FormProvider {...formMethods}>
            <ProtocolPage>
                <GameHeaderEdit game={game}/>
                <ProtocolBox>
                    <ProtocolToolbarEdit game={game} status={status} onSwapTeams={() => setSwapped(!swapped)}
                                         savedTime={savedTime}/>
                    <TeamProtocolDataViewContainer>
                        {swapped ?
                            <>
                                <TeamProtocolDataEdit path={"team1_data"} team={game.team1} key={1}/>
                                <TeamProtocolDataEdit path={"team2_data"} team={game.team2} key={2}/>
                            </>
                            :
                            <>
                                <TeamProtocolDataEdit path={"team2_data"} team={game.team2} key={2}/>
                                <TeamProtocolDataEdit path={"team1_data"} team={game.team1} key={1}/>
                            </>
                        }
                    </TeamProtocolDataViewContainer>
                    <CaptainTaskEdit game={game}/>
                    {game.status != "created" &&
                    <GameTable game={game}>
                        {rounds.map((field, index) => (
                            <GameTableRoundEdit game={game} index={index} key={field.id} swapped={swapped}/>
                        ))}
                    </GameTable>
                    }
                    <ProtocolAdditionalEdit/>
                    <DismissibleAlert variant={"warning"} show={game.status == "finished" && !game.full_access}>
                        Вы потеряете доступ к протоколу через 15 минут после завершения игры.
                        Если вы завершили игру по ошибке, нажмите кнопку «Востановить»
                    </DismissibleAlert>
                    <div className={"mt-4 d-flex justify-content-between flex-row-reverse"}>
                        {status === "saving" ? <Spinner animation={"border"}/> :
                            <ButtonGroup>
                                <Button
                                    onClick={handleSubmit(sendProtocol)}
                                    variant={"success"}
                                >Сохранить</Button>
                                {game.status == 'started' &&
                                <Button
                                    onClick={handleSubmit(finishGame)}
                                    variant={"secondary"}
                                >Завершить</Button>
                                }
                                {game.status == 'created' &&
                                <Button
                                    onClick={handleSubmit(startGame)}
                                    variant={"primary"}
                                >Начать</Button>
                                }
                                {game.status == 'finished' &&
                                <Button
                                    onClick={handleSubmit(restoreGame)}
                                    variant={"secondary"}
                                >Востановить</Button>
                                }
                            </ButtonGroup>
                        }
                        {game.status != "created" &&
                            <ButtonGroup>
                            <Button
                            onClick={removeLastRound}
                            variant={"danger"}
                            disabled={rounds.length <= 1}
                            >Удалить раунд</Button>
                            <Button
                            onClick={appendDefaultRound}
                            variant={"primary"}
                            >Добавить раунд</Button>
                            </ButtonGroup>
                        }
                    </div>
                </ProtocolBox>
            </ProtocolPage>
        </FormProvider>
    )
};

export default GameConsole;
