import React, {Component, ComponentProps, FC, ReactElement} from "react";
import {Link} from "react-router-dom";
import {Tournament} from "../../../types/models";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../store";
import {tournamentService} from "../../../services";
import {Box, BoxTitle} from "../../layout";
import {DateSpan} from "../../layout/";
import Loader from 'react-loader-spinner';

export const TourDate: FC<ComponentProps<'div'> & { tour: Tournament }> = ({tour, className, children, ...props}) => {
    const content: ReactElement = (<>
        {tour.start instanceof Date && (<>
            <DateSpan date={tour.start}/>
            {tour.end instanceof Date && (<>
                -
                <DateSpan date={tour.end}/>
            </>)}
        </>)}
    </>)
    return (
        <div className={"dates"+ (className || "")} {...props}>
            {content}
            {children}
        </div>
    );
}

export const TournamentItem: FC<{ tour: Tournament }> = ({tour}) => {
    return (
        <div className="centered_block block_link">
            <Link to={tour.link}>
                <h2 className="item_title">{tour.title}</h2>
                <TourDate tour={tour}/>
            </Link>
        </div>
    )
};


class TournamentBox extends Component<TournamentBoxProps, { tours: Tournament[] | null, isWaiting: boolean }> {
    constructor(props: TournamentBoxProps) {
        super(props);
        this.state = {
            tours: null,
            isWaiting: true,
        }
    }

    componentDidMount() {
        tournamentService.getAll().then(
            (tours) => {
                this.setState({tours, isWaiting: false});
            }
        );
    }

    render() {
        return (
            <Box size="large">
                <BoxTitle>
                    Турниры
                </BoxTitle>
                {this.props.user?.is_creator &&
                <div className="link_menu">
                    <Link className="link link-small" to="/tournament/new">
                        Создать турнир
                    </Link>
                </div>
                }
                {this.state.tours?.map((tour) =>
                    <TournamentItem tour={tour} key={tour.id}/>
                )}
                {this.state.isWaiting && <div className="centered_block"><Loader
                    type="Rings"
                    color="#000000"
                    height={100}
                    width={100}
                /></div>}
            </Box>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        loggedIn: state.auth.loggedIn,
        user: state.auth.user,
    }
}

const connector = connect(mapStateToProps)
type TournamentBoxProps = ConnectedProps<typeof connector>;


const ConnectedTournamentBox = connector(TournamentBox);
export {ConnectedTournamentBox as TournamentBox};
