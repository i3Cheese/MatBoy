import React, {FC} from 'react';
import {Box, BoxTitle, DateSpan} from "../../layout";
import {gameName} from "../../../helpers";
import {Game} from "../../../types/models";
import {Button, Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {gameLink} from "../../../helpers/links";
import "./GameHeader.scss"

interface GameHeaderBaseProps {
    game: Game,
    edit?: boolean,
}

const GameHeaderBase: FC<GameHeaderBaseProps> = (
    {
        game,
        edit= false,
    }
) => (
    <Box className={"GameHeader"}>
        <BoxTitle className={"GameHeader__name"}>
            {gameName(game)}
        </BoxTitle>
        <div className={"d-flex w-100 flex-wrap"}>
        <Row className={"GameHeader__info flex-grow-1"}>
            <Col className={"GameHeader__time"}>
                <DateSpan date={game.start_time} time local/>
            </Col>
            <Col className={"GameHeader__place"}>
                {game.place}
            </Col>
        </Row>
            {!edit && game.manage_access &&
            <Button
                className={"GameHeader__editButton"}
                as={Link}
                to={`${gameLink(game)}/console`}
                variant={"primary"}
            >
                Изменить
            </Button>
            }
        </div>
    </Box>
)

export const GameHeader: FC<GameHeaderBaseProps> = ({game}) => (
    <GameHeaderBase game={game}/>
)

export const GameHeaderEdit: FC<GameHeaderBaseProps> = ({game}) => (
    <GameHeaderBase game={game} edit/>
)