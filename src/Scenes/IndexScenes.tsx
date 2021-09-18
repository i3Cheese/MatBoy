import React, {FC} from "react";
import {Route} from "react-router";
import AuthScenes from "./AuthScenes";
import TournamentsScene from "./TournamentsScene";
import TournamentScenes from "./TournamentScenes";
import PageWrapper from "../components/PageWrapper";
import ProfileScenes from "./ProfileScenes";
import {SwitchWith404} from "../components";

const IndexScenes: FC = () => {
    return (
        <SwitchWith404>
            <Route path={['/login', '/logout', '/registration']} component={AuthScenes}/>
            <Route path='*'>
                <PageWrapper>
                    <SwitchWith404>
                        <Route path="/" exact component={TournamentsScene} />
                        <Route path="/tournament" component={TournamentScenes} />
                        <Route path="/profile" component={ProfileScenes} />
                    </SwitchWith404>
                </PageWrapper>
            </Route>
        </SwitchWith404>
    )
}

export default IndexScenes;
