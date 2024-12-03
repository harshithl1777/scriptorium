import { NextRequest } from 'next/server';
import prisma from '@/config/prisma';
import { APIUtils } from '@/utils';

export async function POST(req: NextRequest) {
    const userHeader = req.headers.get('x-user');
    const user = JSON.parse(userHeader as string);

    try {
        const {
            title,
            description,
            code,
            language = 'JavaScript',
            tags,
        }: { title: string; description: string; code: string; language?: string; tags: string[] } = await req.json();

        const newTemplate = await prisma.codeTemplate.create({
            data: {
                title,
                description,
                code,
                language,
                author: { connect: { id: user.id } },
                tags: {
                    connectOrCreate: tags.map((tag) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
            include: { tags: true },
        });

        return APIUtils.createNextResponse({
            success: true,
            status: 201,
            payload: newTemplate,
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

export async function GET(req: NextRequest) {
    const userHeader = req.headers.get('x-user');
    const user = JSON.parse(userHeader as string);

    const url = new URL(req.url);
    const title = url.searchParams.get('title');
    const tags = url.searchParams.get('tags');
    const language = url.searchParams.get('language');
    const content = url.searchParams.get('content');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const userOnly = url.searchParams.get('userOnly') === 'true';

    const filters = {
        AND: [
            title ? { title: { contains: title } } : {},
            language ? { language: { equals: language } } : {},
            content
                ? {
                      OR: [{ description: { contains: content } }, { code: { contains: content } }],
                  }
                : {},
            tags
                ? {
                      tags: {
                          some: {
                              name: { in: tags.split(',') },
                          },
                      },
                  }
                : {},
            user && userOnly ? { authorId: user.id } : {},
        ],
    };

    try {
        const totalTemplates = await prisma.codeTemplate.count({ where: filters });
        const templates = await prisma.codeTemplate.findMany({
            where: filters,
            include: { tags: true, author: true },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalPages = Math.ceil(totalTemplates / limit);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: {
                templates,
                pagination: {
                    totalTemplates,
                    totalPages,
                    currentPage: page,
                    limit,
                },
            },
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
