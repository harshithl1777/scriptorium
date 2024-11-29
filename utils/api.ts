import { Model } from '@/types/models';
import { NextResponse } from 'next/server';

class APIUtils {
    static createNextResponse = ({
        success,
        status,
        payload,
        message,
        headers,
    }: {
        success: boolean;
        status: number;
        payload?: object;
        headers?: object;
        message?: string;
    }) => {
        const response: { success: boolean; message?: string; payload?: object } = {
            success,
            message,
        };
        if (payload)
            response.payload =
                'password' in payload
                    ? Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'password'))
                    : payload;
        return NextResponse.json(response, { status, headers: { ...headers } });
    };

    static logError = (error: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.error(error.toString());
        }
    };
}

export default APIUtils;
