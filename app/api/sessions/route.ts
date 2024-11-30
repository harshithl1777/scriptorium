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

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password } = body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return APIUtils.createNextResponse({
                success: false,
                status: 400,
                message: 'Invalid email or password',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return APIUtils.createNextResponse({
                success: false,
                status: 400,
                message: 'Invalid email or password',
            });
        }

        const accessToken = await TokenUtils.generateAccessToken(user);
        const refreshToken = await TokenUtils.generateRefreshToken(user);

        const cookieStore = await cookies();
        await cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, TokenUtils.refreshTokenCookieOptions);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: { accessToken, userID: user.id },
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

export async function PUT(req: NextRequest) {
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

        const newAccessToken = await TokenUtils.generateAccessToken(user as User);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: { accessToken: newAccessToken, userID: user.id },
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

export async function DELETE(_: NextRequest) {
    const cookieStore = cookies();
    (await cookieStore).delete(REFRESH_TOKEN_COOKIE_NAME);

    return APIUtils.createNextResponse({
        success: true,
        status: 204,
        message: 'Session ended successfully',
    });
}
