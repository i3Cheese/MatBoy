import React, {FC, ReactNode, useMemo} from "react";
import {Link, SwitchProps, useLocation} from "react-router-dom";
import {Redirect, Route, Switch} from "react-router";
import {useSelector} from "react-redux";
import {AppState} from "../store";
import PageWrapper from "./PageWrapper";
import {Error} from "../types/errors";
import {Button} from "react-bootstrap";


export const ErrorPage: FC<{ code?: number, message?: string }> = ({code, message, children}) => (
    <>
        <br/>
        <h2>{code || "ERROR"} — {message || "Что-то пошло не так"}</h2>
        <br/>
        {children}
        <h5><Link to={'/feedback'}> Написать нам </Link></h5>
        <p> Телеграмм, для важных сообщений: <a href={"https://t.me/i3cheese"} target={"_blank"}>@i3Cheese</a></p>
        <Button onClick={() => location.reload()}>Перезагрузить страницу</Button>
    </>
);

export const ErrorElement: FC<{code?: number, message?: string, onRetry?: () => void}> = ({code, message, onRetry}) => (
    <>
        <h6 className={"text-danger"}>{code || "ERROR"}</h6>
        <p className={'text-danger'}>Произошла ошибка при загрузке</p>
        {message && <p className={'text-muted'}>{message}</p>}
        {onRetry && <Button onClick={onRetry}>Попробовать ещё раз</Button>}
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

export class ErrorBoundary extends React.Component<{errorPage?: ReactNode}, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(_error: any) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error: any, errorInfo: any) {    // You can also log the error to an error reporting service
        // TODO: logErrorToMyService(error, errorInfo);
        console.log("I CATCH!")
    }

    render() {
        if (this.state.hasError) {      // You can render any custom fallback UI
            if (this.props.errorPage) return this.props.errorPage
            return (
                <div>
                    <h1>
                        Что-то пошло не так.
                    </h1>
                    Нам очень жаль. Данные об ошибке уже отправлены.
                    <div>
                        <button onClick={() => location.reload()}>Перезагрузить страницу</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }

}


export const ErrorsGlobalHandler: FC = ({children}) => {
    const location: any = useLocation();
    if (location.error !== undefined) {
        const error: any = location.error;
        return (<ErrorBoundary><PageWrapper>
                {(() => {
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
                })()}
            </PageWrapper></ErrorBoundary>
        )
    } else {
        return <ErrorBoundary errorPage={<PageWrapper><ErrorPage/></PageWrapper>}>{children}</ErrorBoundary>
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

function parseError(error: Error) {
    const response = error.response;
    const code = response?.code;
    const message = response?.data?.message || response?.statusText || error.message;
    return {code, message};
}

export const ErrorHandler: FC<{ error: Error }> = ({error}) => {
    console.error(error);
    const {code, message} = parseError(error);
    return <RedirectAs code={code} message={message}/>
}

export const LocalErrorHandler: FC<{error: Error, onRetry?: ()=>void}> = ({error, onRetry}) => {
    console.error(error);
    const {code, message} = parseError(error);
    return <ErrorElement code={code} message={message} onRetry={onRetry}/>
}

