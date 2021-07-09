export interface User {
    id: number,
    name: string,
    surname: string,
    patronymic: string,
    fullname: string,
    city: string,
    birthday: string,
    email?: string,
    is_creator?: boolean,
    link: string,
}


export interface Tournament {
    id: number,
    title: string,
    description: string,
    chief: User,
    place: string,
    start: Date | null,
    end: Date | null,
    link: string,
}