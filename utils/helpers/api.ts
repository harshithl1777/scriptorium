import { Model } from '@/types/models';
import { NextResponse } from 'next/server';

export class APIHelper {
    static createNextResponse = ({
        success,
        status,
        payload,
        message,
    }: {
        success: boolean;
        status: number;
        payload?: Model;
        message?: string;
    }) => {
        const response = {
            success,
            ...(payload && 'password' in payload
                ? Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'password'))
                : payload),
            message,
        };
        return NextResponse.json(response, { status });
    };
}
