import React, {FC, useMemo} from "react";
import {Link, SwitchProps, useLocation} from "react-router-dom";
import {Redirect, Route, Switch} from "react-router";
import {useSelector} from "react-redux";
import {AppState} from "../store";
import PageWrapper from "./PageWrapper";
import {Error} from "../types/errors";


export const ErrorPage: FC<{ code?: number, message?: string }> = ({code, message, children}) => (
    <>
        <br/>
        <h2>{code || "ERROR"} — {message || "Что-то пошло не так"}</h2>
        <br/>
        {children}
        <h5><Link to={'/feedback'}> Написать нам </Link></h5>
        <p> Телеграмм, для важных сообщений: <a href={"https://t.me/i3cheese"} target={"_blank"}>@i3Cheese</a></p>
    </>
)


export const UnauthorizedError: FC<{ message?: string }> = ({message}) => (
    <ErrorPage code={401} message={"Войдите в аккаунт"}>{message}</ErrorPage>
)

export const ForbiddenError: FC<{ message?: string }> = ({message}) => (
    <ErrorPage code={403} message={"У вас нет достпа"}>{message}</ErrorPage>
)

export const NotFoundError: FC<{ message?: string }> = ({message}) => (
    <ErrorPage code={404} message={"Тут ничего нет"}>{message}</ErrorPage>
)


export const ErrorsGlobalHandler: FC = ({children}) => {
    const location: any = useLocation();
    if (location.error !== undefined) {
        const error: any = location.error;
        return (<PageWrapper>
                {() => {
                    switch (error.code) {
                        case 401:
                            return <UnauthorizedError message={error.message}/>
                        case 403:
                            return <ForbiddenError message={error.message}/>
                        case 404:
                            return <NotFoundError message={error.message}/>
                        default:
                            return <ErrorPage code={error.code} message={error.message}/>
                    }
                }}
            </PageWrapper>
        )
    } else {
        return <>{children}</>
    }
}

export const RedirectAs: FC<{ message?: string, code?: number }> = ({message, code}) => {
    const location = useLocation();
    return <Redirect to={Object.assign({}, location, {error: {message, code,}})}/>
}

export const Restricted: FC<{ access: boolean, message?: string, loginRequired?: boolean }> = ({
                                                                                                   access,
                                                                                                   message,
                                                                                                   loginRequired = true,
                                                                                                   children
                                                                                               }) => {
    if (access) return <>{children}</>;
    const el = useMemo(() => <RedirectAs message={message} code={403}/>, [message]);
    if (loginRequired) {
        return <LoginRequired>{el}</LoginRequired>
    } else
        return el;
}

export const LoginRequired: FC<{ message?: string }> = ({message, children}) => {
    const auth = useSelector<AppState, AppState["auth"]>((state) => state.auth);
    if (auth.loggedIn) {
        return <>{children}</>
    } else {
        return <RedirectAs code={401} message={message}/>
    }
}

export const SwitchWith404: FC<SwitchProps> = ({children, ...props}) => {
    return (
        <Switch {...props}>
            {children}
            <Route><RedirectAs code={404}/></Route>
        </Switch>
    )
}
//
export const ErrorHandler: FC<{ error: Error }> = ({error}) => {
    console.error(error);
    const response = error.response;
    const code = response?.code;
    const message = response?.data?.message || response?.statusText || error.message;
    return <RedirectAs code={code} message={message}/>
}
