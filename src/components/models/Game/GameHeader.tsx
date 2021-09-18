import React, {FC} from 'react';
import {Box, BoxTitle, DateSpan} from "../../layout";
import {gameName} from "../../../helpers";
import {Game} from "../../../types/models";
import {Col, Row} from "react-bootstrap";


interface GameHeaderBaseProps {
    game: Game,
}

const GameHeaderBase: FC<GameHeaderBaseProps> = (
    {
        game,
    }
) => (
    <Box className={"GameHeader"}>
        <BoxTitle className={"GameHeader__name"}>
            {gameName(game)}
        </BoxTitle>
        <Row className={"GameHeader__info"}>
            <Col className={"GameHeader__time"}>
                <DateSpan date={game.start_time} time local/>
            </Col>
            <Col className={"GameHeader__place"}>
                {game.place}
            </Col>
        </Row>
    </Box>
)

export const GameHeader: FC<GameHeaderBaseProps> = ({game}) => (
    <GameHeaderBase game={game}/>
)

export const GameHeaderEdit: FC<GameHeaderBaseProps> = ({game}) => (
    <GameHeaderBase game={game}/>
)