import React, {FC} from "react";
import {Game} from "../../../types/models";
import {Link} from "react-router-dom";
import {AppLoader, Box, BoxProps, DateTimeSpan} from "../../layout";
import DivLink from "../../layout/DivLink";
import {gameLink} from "../../../helpers/links";
import {gameName} from "../../../helpers";
import {Col, Row} from "react-bootstrap";

export const GameLink: FC<{ game: Game }> = ({game, children}) => (
    <Link to={gameLink(game)}>{children === undefined ? gameName(game) : children}</Link>
)


export const GameItem: FC<{ game: Game }> = ({game}) => (
    <DivLink to={gameLink(game)}>
        <Row>
            <Col sm={6}><h2 className="item_title">{gameName(game)}</h2></Col>
            <Col sm={3}><DateTimeSpan date={game.start}/></Col>
            <Col sm={3}>{game.place}</Col>
        </Row>
    </DivLink>
)

interface GamesBoxProps extends BoxProps {
    games: Game[] | null,
}

export const GamesBox: FC<GamesBoxProps> = ({games, title, ...props}) => (
    <Box title={title || 'Игры'} {...props}>
        {games === null ?
            <AppLoader/>
            :
            games.map(game => (
                <GameItem key={game.id} game={game}/>
            ))
        }
    </Box>
)