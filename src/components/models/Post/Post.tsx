import React, {FC, useCallback, useState} from 'react';
import {Post, PostBasics} from "../../../types/models";
import {AppLoader, BoxContainer} from "../../layout";
import PageHeader from "../../PageHeader";
import {OnPostStatusChange, PostView, PostViewBase} from "./PostView";
import {EditPostFormBox} from "./PostForm";
import {usePost, usePosts} from "../../../helpers/hooks";
import {LocalErrorHandler} from "../../errors";
import produce from "immer";



export interface PostBoxProps {
    post: Post,
    setPost: (post: Post) => void,
    id?: string,
    onStatusChange?: OnPostStatusChange,
}


export const PostBox: FC<PostBoxProps> = ({post, setPost, onStatusChange, ...props}) => {
    const [isEditing, setIsEditing] = useState(false);
    if (isEditing) {
        return <EditPostFormBox
            {...props}
            post={post}
            setPost={(post) => {
                setIsEditing(false);
                setPost(post);
            }}
            onCancel={() => setIsEditing(false)}
        />
    } else {
        return <PostView post={post} onEdit={() => setIsEditing(true)} onStatusChange={onStatusChange} {...props}/>
    }
}

export interface IndependentPostBoxProps {
    post: PostBasics,
    onStatusChange?: OnPostStatusChange,

}

export const IndependentPostBox: FC<IndependentPostBoxProps> = ({post: postBasics, onStatusChange}) => {
    const [post, error, setPost, reloadPost] = usePost(postBasics.id);
    const id = `post${postBasics.id}`
    if (post === null) {
        return <PostViewBase
            id={id}
            title={<h3>{postBasics.title}</h3>}
            content={error ? <LocalErrorHandler error={error} onRetry={reloadPost}/> : <AppLoader/>}
        />
    } else {
        return <PostBox post={post} setPost={setPost} id={id} onStatusChange={onStatusChange}/>
    }
}

export interface PostsListProps {
    tourId: number,
    which?: "archived" | "published" | "all";
    showEmpty?: boolean,
}

export const PostsList: FC<PostsListProps> = ({tourId,  which, showEmpty}) => {
    const [posts, error, setPosts, reloadPosts] = usePosts(tourId, which);
    // useScrollOnLoad(posts !== null);
    const handleStatusChange = useCallback<OnPostStatusChange>((postId, newStatus) => {
        setPosts(produce(posts, draft => {
            if (draft === null) return;
            const index = draft.findIndex((post) => post.id === postId);
            if (index === -1) return;
            if (which !== 'all' && newStatus != which) {
                draft.splice(index, 1);
            } else {
                draft[index].status = newStatus;
            }
            return draft;
        }));
    }, [setPosts, posts]);
    return (
        <BoxContainer>
            {
                error !== null ?
                    <LocalErrorHandler error={error} onRetry={reloadPosts}/>
                    : posts === null ?
                    <AppLoader/>
                    : posts.length !== 0 ?
                    posts.map((post) => <IndependentPostBox post={post} key={post.id} onStatusChange={handleStatusChange}/>)
                    : showEmpty && <h3 className={"text-muted"}>Тут ничего нет</h3>
            }
        </BoxContainer>
    )
}

export const PostPage: FC<{ post: Post, setPost: (post: Post) => void }> = ({post, setPost}) => {
    return <>
        <PageHeader>
            <PageHeader.Title>
                {post.tournament.title}
            </PageHeader.Title>
        </PageHeader>
        <PostBox post={post} setPost={setPost}/>
    </>
}
