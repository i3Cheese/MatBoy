import React, {FC} from 'react';
import {Button, Spinner} from "react-bootstrap";

import "./ProtocolToolbar.scss"
import {Game} from "../../../../types/models";
import {DateSpan} from "../../../layout";

export interface ProtocolToolbarEditProps {
    status: "saved" | "failed" | "saving",
    onSwapTeams: () => any;
    savedTime: Date,
}

export const ProtocolToolbarEdit: FC<ProtocolToolbarEditProps> = ({status, onSwapTeams, savedTime}) => (
    <div className={"ProtocolToolbar"}>
        {status == "failed" &&
        <span className={"ProtocolToolbar__status ProtocolToolbar__status-failed"}>
            Произошла ошибка при сохранении
        </span>
        }
        {status == "saving" &&
        <Spinner animation="border" role="status"
                 className={"ProtocolToolbar__status ProtocolToolbar__status-saving"}>
            <span className="visually-hidden">Сохранение...</span>
        </Spinner>
        }
        {status == "saved" &&
        <span className={"ProtocolToolbar__status ProtocolToolbar__status-saved"}>
            Сохранено в
            <span className={"ProtocolToolbar__status__savedTime"}>
                {savedTime.toLocaleTimeString()}
            </span>
        </span>
        }
        <div className={"ProtocolToolbar__buttons"}>
            <Button
                className={"ProtocolToolbar__buttons__swap"}
                onClick={onSwapTeams}
                variant={"outline-secondary"}
            >
                Поменять команды местами
            </Button>
        </div>
    </div>
);

export const ProtocolToolbarView: FC<{game: Game, onSwapTeams: () => any}> = ({game, onSwapTeams}) => (
    <div className={"ProtocolToolbar"}>
        <span className={"ProtocolToolbar__status ProtocolToolbar__status-saved"}>
            Изменено
            <DateSpan date={game.protocol.updated_at} time className={"ProtocolToolbar__status__savedTime"}/>
        </span>
        <div className={"ProtocolToolbar__buttons"}>
            <Button
                className={"ProtocolToolbar__buttons__swap"}
                onClick={onSwapTeams}
                variant={"outline-secondary"}
            >
                Поменять команды местами
            </Button>
        </div>
    </div>
)


