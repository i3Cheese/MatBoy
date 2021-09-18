import React, {useCallback, useEffect, useState} from "react";
import {addMenuItem, removeMenuItem} from "../actions";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../store";
import {MenuItem} from "../types/menu";
import {leagueServices, teamServices, tournamentServices, userServices} from "../services";
import {sortTeams} from "./funcs";
import gameServices from "../services/game.services";
import {ErrorType} from "../types/errors";

export function useMenuItem(item: MenuItem) {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        addMenuItem(item)(dispatch);
        return () => {
            removeMenuItem(item)(dispatch);
        }
    }, [item,]);
}

export function useLoadingOnCallback<U, T>(f: (data: U) => Promise<T>): [boolean, (data: U) => Promise<T>] {
    const [isLoading, setIsLoading] = useState(false);
    const callback = useCallback((data: U) => {
        setIsLoading(true);
        return f(data).then(
            (r) => {
                setIsLoading(false);
                return r;
            },
            (r) => {
                setIsLoading(false);
                return Promise.reject(r);
            }
        );
    }, [setIsLoading, f]);
    return [isLoading, callback];
}

export function useService<T>(f: () => Promise<T>): [null | T, ErrorType, React.Dispatch<T | null>, () => void] {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ErrorType>(null)
    const getData = useCallback(() => {
        setData(null);
        f().then((data: T) => {setData(data); setError(null);}).catch((e) => {
            console.log("At hook", e)
            setError(e);
        });
    }, [f, setData]);
    useEffect(() => {
        getData()
    }, [getData]);
    return [data, error, setData, getData];
}

export function useTournament(tourId: number) {
    const callback = useCallback(() => tournamentServices.get(tourId), [tourId]);
    return useService(callback);
}
export function useLeague(leagueId: number) {
    const callback = useCallback(() => leagueServices.get(leagueId), [leagueId]);
    return useService(callback);
}
export function useTeam(teamId: number) {
    const callback = useCallback(() => teamServices.get(teamId), [teamId]);
    return useService(callback);
}
export function useGame(gameId: number) {
    const callback = useCallback(() => gameServices.get(gameId), [gameId]);
    return useService(callback);
}
export function useUser(userId: number) {
    const callback = useCallback(() => userServices.get(userId), [userId]);
    return useService(callback);
}

export function useLeagues(tourId: number) {
    const callback = useCallback(() => leagueServices.getLeagues(tourId), [tourId]);
    return useService(callback);
}

export function useTeams(...args : Parameters<typeof teamServices.getTeams>) {
    const callback = useCallback(() => teamServices.getTeams(...args).then(sortTeams), args);
    return useService(callback);
}

export function useGames(leagueId?: number, teamId?: number) {
    const callback = useCallback(() => gameServices.getGames(leagueId, teamId), [leagueId, teamId]);
    return useService(callback);
}
