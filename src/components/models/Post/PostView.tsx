import {BsPrefixProps, BsPrefixRefForwardingComponent} from "react-bootstrap/helpers";
import React, {FC, ReactNode, useState} from "react";
import {Box} from "../../layout/Box/Box";
import {ListGroup, Spinner} from "react-bootstrap";
import {Post} from "../../../types/models";
import {DateSpan} from "../../layout";

import './PostView.scss';
import {MBDropdownItem, ThreeDotsDropdown} from "../../Dropdown";
import {ReplacePropsWithoutRef} from "../../../helpers/componentTypes";
import {postLink} from "../../../helpers/links";
import {ShareButton} from "../../Share";
import {postServices} from "../../../services";

export interface PostViewBaseProps extends BsPrefixProps {
    toolbar?: ReactNode,
    title: string | ReactNode,
    content: ReactNode,
    buttons?: ReactNode,
}


export const PostViewBase: BsPrefixRefForwardingComponent<'div', PostViewBaseProps> = React.forwardRef<HTMLElement, PostViewBaseProps>(
    (
        {
            toolbar,
            content,
            title,
            buttons,
            ...props
        },
        ref,
    ) => (
        <Box className={"Post"} size={"full"} ref={ref} {...props}>
            {toolbar && <div className={"Post__toolbar"}>{toolbar}</div>}
            <ListGroup variant={"flush"}>
                <ListGroup.Item className={"Post__title"}>
                    {title}
                </ListGroup.Item>
                <ListGroup.Item className={"Post__content"}>
                    {content}
                </ListGroup.Item>
                {buttons !== undefined &&
                <ListGroup.Item className={"Post__buttons"}>
                    {buttons}
                </ListGroup.Item>
                }
            </ListGroup>
        </Box>
    ));



export type OnPostStatusChange = (postId: number, newStatus: Post['status']) => void;

export interface PostViewProps{
    post: Post,
    onEdit: () => void,
    onStatusChange?: OnPostStatusChange,
}

export const PostView: FC<ReplacePropsWithoutRef<'div', PostViewProps>> = ({post, onEdit, onStatusChange, ...props}) => {
    const [isLoading, setIsLoading] = useState(false);
    return (
        <PostViewBase
            toolbar={
                <>
                    <ShareButton title={post.title} description={`Новость турнира ${post.tournament.title}`}
                                 relativeUrl={postLink(post)}/>
                    {isLoading?<Spinner animation={"border"}/>:(post.manage_access &&
                    <ThreeDotsDropdown>
                        <MBDropdownItem onClick={() => onEdit()} variant={"primary"}>Редактировать</MBDropdownItem>
                        {onStatusChange && post.manage_access &&
                        (post.status == "published"?
                        <MBDropdownItem
                            onClick={() => {
                                setIsLoading(true);
                                postServices.archivePost(post.id).then(() => {
                                    // setIsLoading(false);
                                    onStatusChange(post.id, "archived");
                                })
                            }}
                        >Заархивировать</MBDropdownItem>:
                        <MBDropdownItem
                            onClick={() => {
                                setIsLoading(true);
                                postServices.publishPost(post.id).then(() => {
                                    // setIsLoading(false);
                                    onStatusChange(post.id, "published");
                                })
                            }}
                        >Разархивировать</MBDropdownItem>)}
                    </ThreeDotsDropdown>
                    )}
                </>
            }
            title={<h3>{post.title}<DateSpan className={"Post__title__publishTime"} date={post.created_at} local time/>
            </h3>}
            content={<div className="content ck-content clearfix" dangerouslySetInnerHTML={{__html: post.content}}/>}
            {...props}
        />
    );
}