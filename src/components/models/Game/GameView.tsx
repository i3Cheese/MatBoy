import React, {FC, useState} from 'react';
import {Game} from "../../../types/models";
import {GameTable, GameTableRoundView, TeamProtocolDataView} from "./ProtocolView";
import {TeamProtocolDataViewContainer} from "./ProtocolView";
import {ProtocolBox, ProtocolPage} from "./ProtocolView/Protocol";
import {ProtocolAdditionalView} from "./ProtocolView/ProtocolAdditional";
import {GameHeader} from "./GameHeader";
import {ProtocolToolbarView} from "./ProtocolView/ProtocolToolbar";

export interface GameViewProps {
    game: Game,
}

const GameView: FC<GameViewProps> = ({game}) => {
    const [swapped, setSwapped] = useState(false);
    return (
        <ProtocolPage>
            <GameHeader game={game}/>
            <ProtocolBox>
                <ProtocolToolbarView game={game} onSwapTeams={() => setSwapped(!swapped)}/>
                <TeamProtocolDataViewContainer>
                    {swapped ?
                        <>
                            <TeamProtocolDataView team_data={game.protocol.team1_data} team={game.team1} key={1}/>
                            <TeamProtocolDataView team_data={game.protocol.team2_data} team={game.team2} key={2}/>
                        </>
                        :
                        <>
                            <TeamProtocolDataView team_data={game.protocol.team2_data} team={game.team2} key={2}/>
                            <TeamProtocolDataView team_data={game.protocol.team1_data} team={game.team1} key={1}/>
                        </>
                    }
                </TeamProtocolDataViewContainer>
                {game.status != "created" &&
                <GameTable game={game}>
                    {game.protocol.rounds.map((round, index) => (
                        <GameTableRoundView round={round} index={index} key={index} swapped={swapped}/>
                    ))}
                </GameTable>}
                <ProtocolAdditionalView additional={game.protocol.additional}/>
            </ProtocolBox>
        </ProtocolPage>
    )
};

export default GameView;
