import {Post, Tournament} from "../../../types/models";
import React, {FC, useState} from "react";
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {AppLoader} from "../../Loader";
import {Button, ButtonGroup, Form, InputGroup} from "react-bootstrap";
import ClassicCKeditorComponent from "../../CKEditor";
import {postServices} from "../../../services";
import {PostViewBase} from "./PostView";
import {ReplacePropsWithoutRef} from "../../../helpers/componentTypes";

export interface PostFormProps {
    post?: Post,
    onSubmit: (data: any) => void,
    isLoading: boolean,
    onCancel: () => void,
}

export const PostForm: FC<ReplacePropsWithoutRef<'form', PostFormProps>> = ({post, onCancel, onSubmit, ...props}) => {
    const isNew = post === undefined;
    const validationSchema = Yup.object().shape(isNew ? {
        title: Yup.string().required(),
        content: Yup.string().required(),
        status: Yup.string().required().oneOf(["published", "archived"]),
    } : {
        title: Yup.string().required(),
        content: Yup.string().required(),
    });
    const {register, handleSubmit: rhfHandleSubmit, formState: {errors}, control} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: post && {
            title: post.title,
            content: post.content,
            status: post.status
        }
    });
    const handleSubmit = (data: any) => {
        onSubmit(data);
    };

    if (props.isLoading) return <AppLoader/>

    return (
        <PostViewBase
            {...props}
            as={'form'}
            onSubmit={rhfHandleSubmit(handleSubmit)}
            title={
                <InputGroup>
                    <InputGroup.Text id={"titleLabel"}>
                        Заголовок
                    </InputGroup.Text>
                    <Form.Control
                        aria-describedby={"titleLabel"}
                        {...register("title")}
                        isInvalid={errors.title !== undefined}
                    />
                    <Form.Control.Feedback type={"invalid"}>
                        {errors.title?.message}
                    </Form.Control.Feedback>
                </InputGroup>
            }
            content={
                <Controller
                    control={control}
                    name={"content"}
                    render={({field}) => (
                        <ClassicCKeditorComponent
                            placeholder={"Содержимое новости"}
                            {...field}
                        />
                    )}
                />
            }
            buttons={
                <ButtonGroup>
                    <Button
                        variant={"danger"}
                        onClick={onCancel}
                    >{"Отменить"}</Button>
                    {isNew ?
                        <Controller
                            name={"status"}
                            control={control}
                            render={({field: {onChange}}) => (
                                <>
                                    <Button
                                        variant={"primary"}
                                        type={"submit"}
                                        onClick={() => onChange("published")}
                                    >Опубликовать</Button>
                                    <Button
                                        variant={"warning"}
                                        type={"submit"}
                                        onClick={() => onChange("archived")}
                                    >Сохранить как черновик</Button>
                                </>
                            )}
                        />
                        :
                        <>
                            <Button
                                variant={"primary"}
                                type={"submit"}
                            >Сохранить</Button>
                        </>
                    }
                </ButtonGroup>
            }
        />
    );
};

export interface NewPostFormBoxProps {
    tour: Tournament,
    setPost: (post: Post) => void
    onCancel: () => void,
}

// Parent component should remove element after setPost().
export const NewPostFormBox: FC<ReplacePropsWithoutRef<'form', NewPostFormBoxProps>> = ({tour, setPost, onCancel, ...props}) => {
    const [isLoading, setLoading] = useState(false);
    const [, setSuccess] = useState<{ success: false } | { success: true, post: Post }>({success: false})
    const handleSubmit = (data: any) => {
        setLoading(true);
        return postServices.postNew(tour.id, data).then(
            (post: Post) => {
                setLoading(false);
                setSuccess({success: true, post: post});
                setPost(post);
            },
            () => {
                setLoading(false);
            });
    }
    return (
        <PostForm onSubmit={handleSubmit} isLoading={isLoading} onCancel={onCancel} {...props}/>
    );
};


interface EditPostFormProps {
    post: Post,
    setPost: (post: Post) => void,
    onCancel: () => void
}

// Parent component should remove element after setPost().
export const EditPostFormBox: FC<ReplacePropsWithoutRef<'form', EditPostFormProps>> = ({post, setPost, onCancel, ...props}) => {
    const [{isLoading}, setState] = useState({isLoading: false, isSuccess: false});
    const handleSubmit = (data: any) => {
        setState({isLoading: true, isSuccess: false});
        return postServices.edit(post.id, data).then(
            (post: Post) => {
                setState({isLoading: false, isSuccess: true});
                setPost(post);
            },
            () => {
                setState({isLoading: false, isSuccess: false});
            });
    }
    return (
        <PostForm onSubmit={handleSubmit} post={post} isLoading={isLoading} onCancel={onCancel} {...props}/>
    );
}
