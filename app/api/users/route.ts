import { prisma } from '@/config';
import { NextRequest } from 'next/server';
import { POSTUsersRequest } from '@/types/api';
import { User } from '@prisma/client';
import { APIHelper } from '@/utils/helpers';
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
        });

        return APIHelper.createNextResponse({ success: true, status: 201, payload: user });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            return APIHelper.createNextResponse({ success: false, status: 409, message: 'Resource Already Exists' });
        }
    }
}
