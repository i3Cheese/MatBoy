import React, {FC, ReactNode} from 'react';
import {Spinner} from "react-bootstrap";

import "./ProtocolToolbar.scss"
import {Game} from "../../../../types/models";
import {DateSpan} from "../../../layout";
import {ThreeDotsDropdown, MBDropdownItem} from "../../../Dropdown";

interface ProtocolToolbarBaseProps {
    game: Game,
    onSwapTeams: () => any,
    save_manager?: ReactNode,
}

const ProtocolToolbarBase: FC<ProtocolToolbarBaseProps> = ({game, onSwapTeams, save_manager}) => (
    <div className={"ProtocolToolbar"}>
        {game.status == "created" &&
        <span className={"ProtocolToolbar__status ProtocolToolbar__status-created"}>
                Игра ещё не началась.
            </span>
        }
        {game.status == "started" &&
        <span className={"ProtocolToolbar__status ProtocolToolbar__status-started"}>
                Игра идёт. Последнее изменение
                <DateSpan date={game.protocol.updated_at} time local
                          className={"ProtocolToolbar__status__time ProtocolToolbar__status__time-updated"}/>
            </span>
        }
        {game.status == "finished" &&
        <span className={"ProtocolToolbar__status ProtocolToolbar__status-finished"}>
                Игра завершена
                <DateSpan
                    date={game.protocol.updated_at} time local
                    className={"ProtocolToolbar__status__time ProtocolToolbar__status__time-finished"}/>
            </span>
        }
        {save_manager}
        <ThreeDotsDropdown>
            <MBDropdownItem
                onClick={onSwapTeams}
                variant={"outline-secondary"}
            >
                Поменять команды местами
            </MBDropdownItem>
        </ThreeDotsDropdown>
    </div>
)

export interface ProtocolToolbarEditProps {
    status: "saved" | "failed" | "saving",
    game: Game,
    onSwapTeams: () => any;
    savedTime: Date,
}

export const ProtocolToolbarEdit: FC<ProtocolToolbarEditProps> = ({game, status, onSwapTeams, savedTime}) => (
    <ProtocolToolbarBase
        game={game}
        onSwapTeams={onSwapTeams}
        save_manager={<>
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
                <span className={"ProtocolToolbar__status__time ProtocolToolbar__status__time-saved"}>
                    {savedTime.toLocaleTimeString()}
                </span>
            </span>
            }
        </>}
    />
);

export const ProtocolToolbarView: FC<{ game: Game, onSwapTeams: () => any }> = ({game, onSwapTeams}) => (
    <ProtocolToolbarBase
        game={game}
        onSwapTeams={onSwapTeams}
    />
)


