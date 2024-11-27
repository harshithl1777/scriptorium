export interface POSTUsersRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatarURL?: string;
    phoneNumber?: string;
}

export interface POSTResponse<T> {
    success: boolean;
    payload: T;
}

export interface GETResponse<T> {
    success: boolean;
    payload: T;
}

export interface PUTResponse<T> {
    success: boolean;
    payload: T;
}

export interface DELETEResponse {
    success: boolean;
}

export interface ErrorResponse {
    success: false;
    message: string;
}
