import { prisma } from '@/config';
import { APIUtils } from '@/utils';
import { User } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    if (!id) {
        return APIUtils.createNextResponse({ success: false, status: 400, message: 'Missing user ID' });
    }

    const userId = parseInt(id, 10);

    try {
        const user: Partial<User> | null = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarURL: true,
                phoneNumber: true,
                isAdmin: true,
                templates: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        tags: true,
                        language: true,
                    },
                },
                blogPosts: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        content: true,
                        tags: true,
                        isHidden: true,
                        templates: true,
                    },
                },
                reports: true,
                UserVote: true,
            },
        });

        if (!user) {
            return APIUtils.createNextResponse({ success: false, status: 404, message: 'User not found' });
        }

        return APIUtils.createNextResponse({ success: true, status: 200, payload: user });
    } catch (error: any) {
        console.error(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: error.toString(),
        });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

    if (!id || (user.id.toString() !== id && !user.isAdmin)) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'Forbidden: You are not allowed to update this account',
        });
    }

    const userId = parseInt(id, 10);

    const body = await req.json();
    const { firstName, lastName, avatarURL, phoneNumber } = body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!existingUser) {
            return APIUtils.createNextResponse({ success: false, status: 404, message: 'User not found' });
        }

        const updatedUser: Partial<User> = await prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName, avatarURL, phoneNumber },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarURL: true,
                phoneNumber: true,
                isAdmin: true,
                templates: true,
                blogPosts: true,
                comments: true,
                reports: true,
            },
        });

        return APIUtils.createNextResponse({ success: true, status: 200, payload: updatedUser });
    } catch (error: any) {
        console.error(error);
        return APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

    if (!id || (user.id.toString() !== id && !user.isAdmin)) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'Forbidden: You are not allowed to delete this account',
        });
    }

    const userId = parseInt(id, 10);

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!existingUser) {
            return APIUtils.createNextResponse({ success: false, status: 404, message: 'User not found' });
        }

        await prisma.user.delete({ where: { id: userId } });

        return APIUtils.createNextResponse({ success: true, status: 200, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error(error);
        return APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() });
    }
}
