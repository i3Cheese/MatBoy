import React, {FC, ReactNode} from 'react';
import {Controller} from 'react-hook-form';
import {Game} from "../../../../types/models";
import {Form} from "react-bootstrap";
import {TeamSelect} from "../../Team";

import './CaptainTask.scss';


export interface CaptainTaskBaseProps {
    captainTask: ReactNode,
    winner: ReactNode,
}

export const CaptainTaskBase: FC<CaptainTaskBaseProps> = ({
                                                              captainTask,
                                                              winner
                                                          }) => (
    <div className={"CaptainTask"}>
        <div className={"CaptainTask__text"}>
            <label className={"CaptainTask__label"}>
                Конкурс капитанов:
            </label>
            {captainTask}
        </div>
        <div className={"CaptainTask__winner"}>
            <label className={"CaptainTask__label"}>
                Победил капитан команды:
            </label>
            {winner}
        </div>
    </div>
)

export const CaptainTaskEdit: FC<{ game: Game }> = ({game,}) => (
    <CaptainTaskBase
        captainTask={
            <Controller
                name={`captain_task`}
                render={({field, fieldState}) => (
                    <Form.Control
                        as={"textarea"}
                        {...field}
                        isInvalid={fieldState.invalid}
                    />
                )}/>}
        winner={
            <TeamSelect path={`captain_winner`} teams={[game.team1, game.team2]} />
        }
    />
);
