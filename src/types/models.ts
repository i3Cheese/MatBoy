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
    chief: User,
    place: string,
    start?: Date,
    end?: Date,
    link?: string,
}