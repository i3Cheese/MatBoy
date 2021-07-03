export interface User {
    id: number,
    name: string,
    surname: string,
    patronymic?: string,
    fullname: string,
    city?: string,
    birthday?: string,
    email?: string,
    is_creator?: boolean,
    link?: string,
}

