import React, {FC} from "react";
import {
    BoxContainer,
    ErrorHandler, LoaderPage, NewPostFormBox, PostPage, PostsList,
    Restricted, SwitchWith404,
} from "../../../components";
import MenuItemComponent from "../../../components/MenuItemComponent";
import {Route, useHistory, useParams, useRouteMatch} from "react-router";
import {usePost} from "../../../helpers/hooks";
import {Tournament} from "../../../types/models";
import {postLink, tourLink} from "../../../helpers/links";
import {PageHeader, PageHeaderTitle} from "../../../components/PageHeader/PageHeader";


const PostIdScenes: FC = () => {
    const {path} = useRouteMatch();
    const {postId: postIdString} = useParams<{ postId: string }>();
    const postId = Number(postIdString);
    const [post, error, setPost] = usePost(postId);

    if (error != null) return <ErrorHandler error={error}/>
    if (post === null) return <LoaderPage/>;
    return (
        <MenuItemComponent title={post.title}>
            <SwitchWith404>
                <Route path={path} exact>
                    <PostPage post={post} setPost={setPost}/>
                </Route>
            </SwitchWith404>
        </MenuItemComponent>
    );
};

const PostArchivedScene: FC<{tour: Tournament}> = ({tour}) => {
    return (
        <Restricted access={tour.manage_access}>
        <MenuItemComponent title={"Архив новостей"}>
            <PageHeader>
                <PageHeaderTitle>
                    Архив новостей турнира "{tour.title}"
                </PageHeaderTitle>
            </PageHeader>
            <PostsList tourId={tour.id} which={"archived"} showEmpty/>
        </MenuItemComponent>
        </Restricted>
    );
}

const PostScenes: FC<{tour: Tournament}> = ({tour}) => {
    const {path} = useRouteMatch();
    const history = useHistory();
    return (
        <SwitchWith404>
            <Route path={`${path}/new`}>
                <BoxContainer>
                    <NewPostFormBox
                        tour={tour}
                        setPost={(post) => history.push(postLink(post))}
                        onCancel={() => history.push(tourLink(tour))}
                    />
                </BoxContainer>
            </Route>
            <Route path={`${path}/archived`}>
                <PostArchivedScene tour={tour}/>
            </Route>
            <Route path={`${path}/:postId`} component={PostIdScenes}/>
        </SwitchWith404>
    )
};

export default PostScenes;
