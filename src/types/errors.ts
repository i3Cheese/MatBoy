export type Error = any;
export type ErrorType = null | Error;

export type LoginError = {message: string, errors: {password?: string, email?: string}, success: false}