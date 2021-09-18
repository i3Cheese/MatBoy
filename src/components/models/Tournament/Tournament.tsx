import React, {Component, ComponentProps, FC, ReactElement} from "react";
import {Link} from "react-router-dom";
import {Tournament} from "../../../types/models";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../store";
import {tournamentServices} from "../../../services";
import {AppLoader, Box, BoxTitle,} from "../../layout";
import {DateSpan} from "../../layout/";
import DivLink from "../../layout/DivLink";
import SimpleMenu from "../../SimpleMenu";
import {tourLink} from "../../../helpers/links";

export const TourDate: FC<ComponentProps<'div'> & { tour: Tournament }> = ({tour, className, children, ...props}) => {
    const content: ReactElement = (<>
        {tour.start_time instanceof Date && (<>
            <DateSpan date={tour.start_time}/>
            {tour.end_time instanceof Date && (<>
                -
                <DateSpan date={tour.end_time}/>
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
        <DivLink to={tourLink(tour)}>
            <h2 className="item_title">{tour.title}</h2>
            <TourDate tour={tour}/>
        </DivLink>
    )
};


class TournamentsBox extends Component<TournamentBoxProps, { tours: Tournament[] | null, isWaiting: boolean }> {
    constructor(props: TournamentBoxProps) {
        super(props);
        this.state = {
            tours: null,
            isWaiting: true,
        }
    }

    componentDidMount() {
        tournamentServices.getAll().then(
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
                <SimpleMenu>
                    <Link className="link link-small" to="/tournament/new">
                        Создать турнир
                    </Link>
                </SimpleMenu>
                }
                {this.state.tours?.map((tour) =>
                    <TournamentItem tour={tour} key={tour.id}/>
                )}
                {this.state.isWaiting && <AppLoader/>}
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
const ConnectedTournamentBox = connector(TournamentsBox);
export {ConnectedTournamentBox as TournamentBox};


