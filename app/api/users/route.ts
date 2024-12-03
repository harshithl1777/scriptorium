import { prisma } from '@/config';
import { NextRequest } from 'next/server';
import { POSTUsersRequest } from '@/types/api';
import { User } from '@prisma/client';
import { APIUtils } from '@/utils';
import bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function POST(req: NextRequest) {
    try {
        const body: POSTUsersRequest = await req.json();
        const { firstName, lastName, email, password: unhashedPassword, avatarURL, phoneNumber } = body;

        const password = await bcrypt.hash(unhashedPassword, 10);

        const user: User = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password,
                avatarURL,
                phoneNumber,
            },
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
                    },
                },
                blogPosts: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        content: true,
                        tags: true,
                    },
                },
                reports: true,
                UserVote: true,
            },
        });

        return APIUtils.createNextResponse({ success: true, status: 201, payload: user });
    } catch (error: any) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            return APIUtils.createNextResponse({ success: false, status: 409, message: 'Resource Already Exists' });
        }
    }
}
