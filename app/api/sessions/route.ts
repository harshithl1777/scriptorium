// pages/api/sessions/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/utils/jwt';
import { APIHelper } from '@/utils/helpers';
import { logError } from '@/utils/helpers';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password } = body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return APIHelper.createNextResponse({
                success: false,
                status: 400,
                message: 'Invalid email or password',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return APIHelper.createNextResponse({
                success: false,
                status: 400,
                message: 'Invalid email or password',
            });
        }

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        // Set the refresh token as an HTTP-only cookie
        // Note: Adjust the way you set cookies according to your framework
        // For example, in Next.js 13, you can use the new cookies API

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: { accessToken },
            // Include Set-Cookie header for refreshToken if necessary
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Something went wrong',
        });
    }
}

export async function PUT(req: NextRequest) {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
        return APIHelper.createNextResponse({
            success: false,
            status: 401,
            message: 'Refresh token required',
        });
    }

    try {
        const user = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        if (!user) {
            return APIHelper.createNextResponse({
                success: false,
                status: 403,
                message: 'Invalid refresh token',
            });
        }

        const newAccessToken = await generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        // Update the refresh token cookie

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: { accessToken: newAccessToken },
            // Include Set-Cookie header for newRefreshToken if necessary
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Something went wrong',
        });
    }
}

export async function DELETE(req: NextRequest) {
    // Clear the refresh token cookie
    // Adjust the cookie clearing according to your framework

    return APIHelper.createNextResponse({
        success: true,
        status: 204,
        message: 'Session ended successfully',
    });
}