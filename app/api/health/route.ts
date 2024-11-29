import os from 'os';
import { NextRequest, NextResponse } from 'next/server';
import { APIUtils } from '@/utils';

export async function GET(req: NextRequest) {
    try {
        const uptime = process.uptime();
        const freeMemory = os.freemem();
        const totalMemory = os.totalmem();
        const environment = process.env.NODE_ENV || 'unknown';

        const healthInfo = {
            uptime: `${Math.floor(uptime)}s`,
            freeMemory: `${(freeMemory / 1024 / 1024).toFixed(2)} MB`,
            totalMemory: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
            environment,
            timestamp: new Date().toISOString(),
        };

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: healthInfo,
        });
    } catch (error) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: 'Health check failed',
        });
    }
}
