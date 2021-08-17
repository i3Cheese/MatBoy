import React, {useCallback, useEffect, useState} from "react";
import {addMenuItem, removeMenuItem} from "../actions";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../store";
import {MenuItem} from "../types/menu";
import {leagueServices, teamServices} from "../services";
import {sortTeams} from "./funcs";
import gameServices from "../services/game.services";

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

export function useService<T>(f: () => Promise<T>): [T | null, React.Dispatch<T | null>, () => void] {
    const [data, setData] = useState<T | null>(null);
    const getData = useCallback(() => {
        setData(null);
        f().then((data: T) => setData(data));
    }, [f, setData]);
    useEffect(() => {
        getData()
    }, [getData]);
    return [data, setData, getData];
}

export function useLeagues(tourId: number) {
    const callback = useCallback(() => leagueServices.getLeagues(tourId), [tourId]);
    return useService(callback);
}

export function useTeams(tourId?: number, leagueId?: number) {
    const callback = useCallback(() => teamServices.getTeams(tourId, leagueId).then(sortTeams), [tourId, leagueId]);
    return useService(callback);
}

export function useGames(leagueId?: number, teamId?: number) {
    const callback = useCallback(() => gameServices.getGames(leagueId, teamId), [leagueId, teamId]);
    return useService(callback);
}