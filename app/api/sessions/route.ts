<<<<<<< HEAD
import bcrypt from 'bcryptjs';
import { prisma } from '@/config';
import { NextRequest } from 'next/server';

import { APIUtils, TokenUtils } from '@/utils';
import { REFRESH_TOKEN_COOKIE_NAME, TokenType } from '@/types/constants';
import { User } from '@prisma/client';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    if (!refreshToken) {
        return APIUtils.createNextResponse({
            success: false,
            status: 401,
            message: 'Refresh token required',
        });
    }

    try {
        const user = await TokenUtils.verifyToken(refreshToken, TokenType.REFRESH);
        if (!user) {
            return APIUtils.createNextResponse({
                success: false,
                status: 401,
                message: 'Invalid refresh token',
            });
        }

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
        });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: error.toString(),
        });
    }
}
=======
// pages/api/sessions/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/utils/jwt';
import { APIHelper } from '@/utils/helpers';
import { logError } from '@/utils/helpers';
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password } = body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
<<<<<<< HEAD
            return APIUtils.createNextResponse({
=======
            return APIHelper.createNextResponse({
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
                success: false,
                status: 400,
                message: 'Invalid email or password',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
<<<<<<< HEAD
            return APIUtils.createNextResponse({
=======
            return APIHelper.createNextResponse({
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
                success: false,
                status: 400,
                message: 'Invalid email or password',
            });
        }

<<<<<<< HEAD
        const accessToken = await TokenUtils.generateAccessToken(user);
        const refreshToken = await TokenUtils.generateRefreshToken(user);

        const cookieStore = await cookies();
        await cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, TokenUtils.refreshTokenCookieOptions);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: { accessToken, user },
        });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: error.toString(),
=======
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
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
        });
    }
}

export async function PUT(req: NextRequest) {
<<<<<<< HEAD
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    if (!refreshToken) {
        return APIUtils.createNextResponse({
=======
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
        return APIHelper.createNextResponse({
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
            success: false,
            status: 401,
            message: 'Refresh token required',
        });
    }

    try {
<<<<<<< HEAD
        const user = await TokenUtils.verifyToken(refreshToken, TokenType.REFRESH);
        if (!user) {
            return APIUtils.createNextResponse({
                success: false,
                status: 401,
=======
        const user = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        if (!user) {
            return APIHelper.createNextResponse({
                success: false,
                status: 403,
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
                message: 'Invalid refresh token',
            });
        }

<<<<<<< HEAD
        const newAccessToken = await TokenUtils.generateAccessToken(user as User);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: { accessToken: newAccessToken, user },
        });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: error.toString(),
=======
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
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
        });
    }
}

<<<<<<< HEAD
export async function DELETE(_: NextRequest) {
    const cookieStore = cookies();
    (await cookieStore).delete(REFRESH_TOKEN_COOKIE_NAME);

    return APIUtils.createNextResponse({
=======
export async function DELETE(req: NextRequest) {
    // Clear the refresh token cookie
    // Adjust the cookie clearing according to your framework

    return APIHelper.createNextResponse({
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
        success: true,
        status: 204,
        message: 'Session ended successfully',
    });
<<<<<<< HEAD
}
=======
}
>>>>>>> 6f5c66a7c0144aa24872f0ee38f1db34e3c4a24a
