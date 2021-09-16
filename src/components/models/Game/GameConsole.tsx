import React, {FC, useCallback, useEffect, useState} from 'react';
import {Game, Protocol} from "../../../types/models";
import {Box, BoxTitle} from "../../layout";
import {gameName} from "../../../helpers";
import {CaptainTaskEdit, GameTable, GameTableRoundEdit} from "./ProtocolView";
import {TeamProtocolDataEdit, TeamProtocolDataViewContainer} from "./ProtocolView";
import {protocolObject} from "../../../helpers/yupFields";
import {useFieldArray, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, ButtonGroup} from "react-bootstrap";
import {FormProvider} from 'react-hook-form';
import {ProtocolBox, ProtocolPage} from "./ProtocolView/Protocol";
import {ProtocolToolbarEdit} from "./ProtocolView/ProtocolToolbarEdit";
import {ProtocolAdditionalEdit} from "./ProtocolView/ProtocolAdditional";
import {protocolServices} from "../../../services";
import {GameHeaderEdit} from "./GameHeader";

export interface GameConsoleProps {
    game: Game,
}

function useProtocol(initialGame: Game) {
    const gameId = initialGame.id;
    const [game, setGame] = useState(initialGame);
    const [status, setStatus] = useState<"saved" | "failed" | "saving">("saved");
    const [savedTime, setSavedTime] = useState(new Date());
    const sendProtocol = useCallback((data: any) => {
        setStatus("saving");
        return protocolServices.edit(data, gameId).then(
            (game) => {
                setStatus("saved");
                setSavedTime(new Date());
                setGame(game);
                return game;
            }).catch(()=>setStatus("failed"));
    }, [setStatus, gameId]);
    return {game, status, savedTime, sendProtocol};
}


const GameConsole: FC<GameConsoleProps> = ({game: initialGame, ...props}) => {
    const {game, status, sendProtocol, savedTime} = useProtocol(initialGame);
    const validationSchema = protocolObject(game);
    const formMethods = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: game.protocol,
        mode: "all",
    });
    const {control, handleSubmit, formState} = formMethods;
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
        if (rounds.length == 0) appendDefaultRound();
    }, [rounds.length]);

    const [swapped, setSwapped] = useState(false);

    return (
        <FormProvider {...formMethods}>
            <ProtocolPage>
                <GameHeaderEdit game={game}/>
                <ProtocolBox>
                    <ProtocolToolbarEdit status={status} onSwapTeams={()=>setSwapped(!swapped)} savedTime={savedTime}/>
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
                    <GameTable game={game}>
                        {rounds.map((field, index) => (
                            <GameTableRoundEdit game={game} index={index} key={field.id} swapped={swapped}/>
                        ))}
                    </GameTable>
                    <ProtocolAdditionalEdit/>
                    <div className={"mt-4 d-flex justify-content-between"}>
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
                        <ButtonGroup>
                            <Button
                                onClick={handleSubmit(sendProtocol)}
                                variant={"success"}
                            >Сохранить</Button>
                            <Button
                                onClick={appendDefaultRound}
                                title={"Добавить раунд"}
                                variant={"secondary"}
                            >Завершить</Button>
                        </ButtonGroup>
                    </div>
                </ProtocolBox>
            </ProtocolPage>
        </FormProvider>
    )
};

export default GameConsole;
