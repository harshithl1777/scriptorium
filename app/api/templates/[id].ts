// pages/api/templates/[id].ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';
import { logError } from '@/utils/helpers';
import { User } from '@prisma/client';
import { APIHelper } from '@/utils/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const templateId = parseInt(id, 10);

    try {
        const template = await prisma.codeTemplate.findUnique({
            where: { id: templateId },
            include: { tags: true },
        });

        if (!template) {
            return APIHelper.createNextResponse({
                success: false,
                status: 404,
                message: 'Template not found',
            });
        }

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: template,
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to retrieve template',
        });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const userHeader = req.headers.get('x-user');
    const user: User | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return APIHelper.createNextResponse({
            success: false,
            status: 401,
            message: 'Unauthorized: User not authenticated',
        });
    }

    const templateId = parseInt(id, 10);

    const template = await prisma.codeTemplate.findUnique({
        where: { id: templateId },
        select: { authorId: true },
    });

    if (!template) {
        return APIHelper.createNextResponse({
            success: false,
            status: 404,
            message: 'Template not found',
        });
    }

    if (template.authorId !== user.id && !user.isAdmin) {
        return APIHelper.createNextResponse({
            success: false,
            status: 403,
            message: 'Forbidden: You do not own this template',
        });
    }

    const body = await req.json();
    const { title, explanation, tags, code } = body;

    try {
        const updatedTemplate = await prisma.codeTemplate.update({
            where: { id: templateId },
            data: {
                title,
                explanation,
                code,
                tags: {
                    set: [],
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
            include: { tags: true },
        });

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: updatedTemplate,
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to update template',
        });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const userHeader = req.headers.get('x-user');
    const user: User | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return APIHelper.createNextResponse({
            success: false,
            status: 401,
            message: 'Unauthorized: User not authenticated',
        });
    }

    const templateId = parseInt(id, 10);

    const template = await prisma.codeTemplate.findUnique({
        where: { id: templateId },
        select: { authorId: true },
    });

    if (!template) {
        return APIHelper.createNextResponse({
            success: false,
            status: 404,
            message: 'Template not found',
        });
    }

    if (template.authorId !== user.id && !user.isAdmin) {
        return APIHelper.createNextResponse({
            success: false,
            status: 403,
            message: 'Forbidden: You do not own this template',
        });
    }

    try {
        await prisma.codeTemplate.delete({ where: { id: templateId } });

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            message: 'Template deleted successfully',
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to delete template',
        });
    }
}