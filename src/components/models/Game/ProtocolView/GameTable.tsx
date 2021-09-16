import React, {ComponentProps, FC, ReactNode, useCallback, useEffect} from 'react';
import classnames from "classnames";
import {CallType, Game, Round, TeamRoundData, User} from "../../../../types/models";
import TableContainer from "../../../layout/TableContainer";

import './GameTable.scss';
import {Controller, useFieldArray, useFormContext} from "react-hook-form";
import {UserLink, UserSelect} from "../../User";
import {Form, Table} from "react-bootstrap";
import {callTypes, callTypeToUnicode} from "../../../../helpers";


const GameTableHeader: FC<ComponentProps<'tr'>> = ({className, ...props}) => (
    <thead>
    <tr className={classnames("GameTable__header", className)} {...props}>
        <th className={"GameTable__header__index"}>№</th>
        <th className={"GameTable__header__players"}>Команда</th>
        <th className={"GameTable__header__points"}>Баллы</th>
        <th className={"GameTable__header__problem"}>Задача</th>
        <th className={"GameTable__header__callType"}>Вызов</th>
        <th className={"GameTable__header__points"}>Баллы</th>
        <th className={"GameTable__header__players"}>Команда</th>
        <th className={"GameTable__header__points"}>Жюри</th>
        <th className={"GameTable__header__additional"}>Примечания</th>
    </tr>
    </thead>
)

interface GameTableRoundBaseProps extends ComponentProps<'tr'> {
    index: number,
    player1: ReactNode,
    points1: ReactNode,
    player2: ReactNode,
    points2: ReactNode,
    problem: ReactNode,
    callType: ReactNode,
    judgePoints: ReactNode
    additional: ReactNode,
    swapped: boolean,
}

const GameTableRoundBase: FC<GameTableRoundBaseProps> = (
    {
        className,
        index,
        player1,
        player2,
        points1,
        points2,
        problem,
        callType,
        judgePoints,
        additional,
        children,
        swapped,
        ...props
    }) => (
    <tr className={classnames("GameTable", className)} {...props}>
        {[
        <td className="GameTable__number" key={"number"}>{index}</td>,
        <td className="GameTable__players" key={swapped?"player2":"player1"}>
            {swapped?player2:player1}
        </td>,
        <td className="GameTable__points" key={swapped?"points2":"points1"}>
            {swapped?points2:points1}
        </td>,
        <td className="GameTable__problem" key={"problem"}>
            {problem}
        </td>,
        <td className="GameTable__callType" key={"callType"}>
            {callType}
        </td>,
        <td className="GameTable__points" key={swapped?"points1":"points2"}>
            {swapped?points1:points2}
        </td>,
        <td className="GameTable__players" key={swapped?"player1":"player2"}>
            {swapped?player1:player2}
        </td>,
        <td className="GameTable__points" key={"judgePoints"}>
            {judgePoints}
        </td>,
        <td className="GameTable__additional" key={"additional"}>
            {additional}
        </td>,
        ]}
        {children}
    </tr>
);


export const GameTableRoundView: FC<{
    round: Round,
    index: number,
    path?: string,
    swapped: boolean,
}> = ({round, index, swapped}) => (
    <GameTableRoundBase
        index={index + 1}
        player1={<PlayersAndStarsView team_data={round.team1_data}/>}
        points1={round.team1_data.points}
        player2={<PlayersAndStarsView team_data={round.team2_data}/>}
        points2={round.team2_data.points}
        problem={round.problem}
        callType={<CallTypeView value={round.call_type} swapped={swapped}/>}
        judgePoints={12 - round.team1_data.points - round.team2_data.points}
        additional={round.additional}
        swapped={swapped}
    />
)




export const GameTableRoundEdit: FC<{
    game: Game,
    index: number,
    path?: string,
    swapped: boolean,
}> = (
    {
        game,
        index,
        path,
        swapped
    }) => {
    path = path === undefined ? `rounds.${index}` : path;
    const {watch} = useFormContext();
    const watchJudgePoints = 12 - watch(`${path}.team1_data.points`) - watch(`${path}.team2_data.points`);
    return (
        <GameTableRoundBase
            index={index + 1}
            player1={<PlayersAndStarsSelect
                path={`${path}.team1_data`}
                users={game.team1.players}
            />}
            points1={<PointsSelect path={`${path}.team1_data.points`}/>}
            player2={<PlayersAndStarsSelect
                path={`${path}.team2_data`}
                users={game.team2.players}
            />}
            points2={<PointsSelect path={`${path}.team2_data.points`}/>}
            problem={<ProblemSelect path={`${path}.problem`}/>}
            callType={<CallTypeSelect path={`${path}.call_type`} swapped={swapped}/>}
            judgePoints={watchJudgePoints}
            additional={<AdditionalInput path={`${path}.additional`}/>}
            swapped={swapped}
        />
    )
}

const PlayersAndStarsView: FC<{ team_data: TeamRoundData }> = (
    {team_data, ...props}) =>
    (<>
            <div className={"GameTable__players__stars"}>
                {Array.from({length: team_data.stars}, (_, i) => (
                    <span
                        key={i}
                        className={"GameTable__players__stars__star"}
                    >*</span>
                ))}
            </div>
            {team_data.players.map((player, index) =>
                <div className={"GameTable__players__player"}>
                    <UserLink user={player} className={"GameTable__players__player__link"}/>
                </div>
            )}
        </>
    );

const PlayersAndStarsSelect: FC<{ path: string, users: User[] }> = (
    {path, users, ...props}) => {
    const {fields, append, remove} = useFieldArray({
        name: `${path}.players`,
        keyName: "key",
    });
    const defaultAppend = useCallback(() => append({id: undefined}), [append]);
    useEffect(() => {
        if (fields.length === 0) defaultAppend();
    }, [fields.length])
    return (
        <>
            <Controller
                name={`${path}.stars`}
                render={({field, fieldState}) => (
                    <div className={"GameTable__players__stars"}>
                        {Array.from({length: field.value || 0}, (_, i) => (
                            <button
                                key={i}
                                className={"GameTable__players__stars__star"}
                                tabIndex={-1}
                                onClick={() => field.onChange((field.value || 1) - 1)}
                                title={"Убрать таймаут"}
                            >*</button>
                        ))}
                        <button
                            className={"GameTable__players__stars__star GameTable__players__stars__star-new"}
                            tabIndex={-1}
                            onClick={() => field.onChange((field.value || 0) + 1)}
                            title={"Добавить таймаут"}
                        >*
                        </button>
                    </div>
                )}
            />
            {fields.map((field, index) =>
                <UserSelect
                    key={field.key}
                    path={`${path}.players.${index}`}
                    users={users}
                />
            )}
            <div className={"GameTable__players__buttons"}>
                <button
                    onClick={defaultAppend}
                    title={"Добавить игрока"}
                >+
                </button>
                {fields.length > 1 &&
                <button
                    onClick={() => remove(fields.length - 1)}
                    title={"Убрать игрока"}
                >-</button>
                }
            </div>
        </>
    );
};


const PointsSelect: FC<{
    path: string,
}> = ({path, ...props}) => (
    <Controller
        name={path}
        render={({field, fieldState}) => (
            <Form.Control {...field} isInvalid={fieldState.invalid}
                          type="number"
                          min={0} max={12}
            />
        )}
    />
)

const ProblemSelect: FC<{
    path: string
}> = ({path}) => (
    <Controller
        name={path}
        render={({field, fieldState}) => (
            <Form.Control
                {...field}
                isInvalid={fieldState.invalid}
                type={"number"}
            />
        )}
    />
)

const CallTypeSelect: FC<{
    path: string,
    swapped: boolean,
}> = ({path,swapped}) => (
    <Controller
        name={path}
        render={({field, fieldState}) => (
            <Form.Select
                {...field}
                isInvalid={fieldState.invalid}
            >
                {callTypes.map(([value, char], index) => {
                    const inIndex = swapped ? index ^ 1 : index;
                    return (
                        <option value={callTypes[inIndex][0]} key={inIndex}>{char}</option>
                    );
                })}
            </Form.Select>
        )}
    />
)

const CallTypeView: FC<{
    value: CallType,
    swapped: boolean,
}> = ({value, swapped}) => (
    <>{callTypes[swapped?((value - 1)^1):value-1][1]}</>
);


const AdditionalInput: FC<{
    path: string
}> = ({path}) => (
    <Controller
        name={path}
        render={({field, fieldState}) => (
            <Form.Control
                as={"textarea"}
                placeholder={"Если что-то пошло не так..."}
                {...field}
                isInvalid={fieldState.invalid}
            />
        )}
    />
)

export const GameTable: FC<{
    game: Game,
}> = (
    {
        game,
        children,
        ...props
    }
) => {
    return <TableContainer>
        <Table striped bordered className={"GameTable"} responsive={"xl"} {...props}>
            <GameTableHeader/>
            <tbody>
            {children}
            </tbody>
        </Table>
    </TableContainer>
}