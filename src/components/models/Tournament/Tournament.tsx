import React, {Component, ComponentProps, FC, ReactElement} from "react";
import {Link} from "react-router-dom";
import {Tournament} from "../../../types/models";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../store";
import {tournamentService} from "../../../services";
import {Box, BoxContainer, BoxTitle, InfoBox} from "../../layout";
import {DateSpan} from "../../layout/";
import Loader from 'react-loader-spinner';
import DivLink from "../../layout/DivLink";
import SimpleMenu from "../../SimpleMenu";
import {useRouteMatch} from "react-router";
import PageHeader from "../../PageHeader";
import {LeaguesBox} from "../League/League";
import {BreadcrumbItem} from "react-bootstrap";

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
        <DivLink to={`/tournament/${tour.id}`}>
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
                <SimpleMenu>
                    <Link className="link link-small" to="/tournament/new">
                        Создать турнир
                    </Link>
                </SimpleMenu>
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
const ConnectedTournamentBox = connector(TournamentsBox);
export {ConnectedTournamentBox as TournamentBox};


export const TournamentPage: FC<{tour: Tournament}> = ({tour}) => {
    const {url} = useRouteMatch();
    return (
        <>
            <PageHeader>
                <PageHeader.Title>
                    {tour.title}
                </PageHeader.Title>
                <SimpleMenu>
                    <BreadcrumbItem >подать заявку</BreadcrumbItem>
                    {tour.edit_access && [
                        <BreadcrumbItem>редактировать</BreadcrumbItem>,
                        <Link to={`${url}/console`}>управлять</Link>,
                        <Link to={`${url}/post/new`}>создать новость</Link>,
                    ]}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer covid>
                <LeaguesBox tourId={tour.id}/>
                <Box type="square">
                    <InfoBox>
                        <dd className="col-sm-6">Место проведения:</dd>
                        <dt className="col-sm-6">{tour.place}</dt>
                        <dd className="col-sm-6">Дата начала:</dd>
                        <dt className="col-sm-6"><DateSpan date={tour.start}/></dt>
                        <dd className="col-sm-6">Дата окончания:</dd>
                        <dt className="col-sm-6"><DateSpan date={tour.end}/></dt>
                    </InfoBox>
                </Box>
            </BoxContainer>
        </>
    );
}
