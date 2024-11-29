import { ADMIN, HTTPMethods, USER, VISITOR } from '@/types/constants';
import { JWTPayload } from 'jose';
import { z } from 'zod';

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

export type HTTPMethod = HTTPMethods.GET | HTTPMethods.POST | HTTPMethods.PUT | HTTPMethods.PATCH | HTTPMethods.DELETE;

export interface RouteConfig {
    access: typeof VISITOR | typeof USER | typeof ADMIN;
    schema: z.AnyZodObject | null;
}

export interface UserJWTPayload extends JWTPayload {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatarURL?: string;
    phoneNumber?: string;
    isAdmin: boolean;
}
