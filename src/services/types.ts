export interface ErrorResponse {
    success: false,
    message: string,
}

export type SuccessResponse<T = {}> = T & {
    success: true,
}

export type Response<T = {}> = SuccessResponse<T>;