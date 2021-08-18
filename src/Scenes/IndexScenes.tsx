import React, {FC} from "react";
import {Route, Switch} from "react-router";
import AuthScenes from "./AuthScenes";
import TournamentsScene from "./TournamentsScene";
import TournamentScenes from "./TournamentScenes";
import PageWrapper from "../components/PageWrapper";
import ProfileScenes from "./ProfileScenes";

const IndexScenes: FC = () => {
    return (
        <Switch>
            <Route path={['/login', '/logout', '/registration']} component={AuthScenes}/>
            <Route path='*'>
                <PageWrapper>
                    <Switch>
                        <Route path="/" exact component={TournamentsScene} />
                        <Route path="/tournament" component={TournamentScenes} />
                        <Route path="/profile" component={ProfileScenes} />
                    </Switch>
                </PageWrapper>
            </Route>
        </Switch>
    )
}

export default IndexScenes;
