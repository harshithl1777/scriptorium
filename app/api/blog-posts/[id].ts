// pages/api/blog-posts/[id].ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { logError } from '@/utils/logger';
import { BlogPost, User } from '@prisma/client';
import { APIHelper } from '@/utils/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const post = await prisma.blogPost.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                tags: true,
                templates: true,
                author: true,
                comments: { orderBy: { upvotes: 'desc' } },
            },
        });

        if (!post) {
            return APIHelper.createNextResponse({
                success: false,
                status: 404,
                message: 'Blog post not found',
            });
        }

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: post,
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to retrieve blog post',
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

    const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id, 10) },
        select: { authorId: true },
    });

    if (!blogPost) {
        return APIHelper.createNextResponse({
            success: false,
            status: 404,
            message: 'Blog post not found',
        });
    }

    const isOwnerOrAdmin = user.id === blogPost.authorId || user.isAdmin;
    if (!isOwnerOrAdmin) {
        return APIHelper.createNextResponse({
            success: false,
            status: 403,
            message: 'Forbidden: You are not allowed to update this blog post',
        });
    }

    const body = await req.json();
    const { title, description, content, tags, templateIds = [], upvotes, downvotes } = body;

    try {
        const post = await prisma.blogPost.update({
            where: { id: parseInt(id, 10) },
            data: {
                title,
                description,
                content,
                tags: {
                    set: [],
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                templates: {
                    set: [],
                    connect: templateIds.map((tid: number) => ({ id: tid })),
                },
                upvotes,
                downvotes,
            },
            include: { tags: true, templates: true },
        });

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: post,
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to update blog post',
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

    const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id, 10) },
        select: { authorId: true },
    });

    if (!blogPost) {
        return APIHelper.createNextResponse({
            success: false,
            status: 404,
            message: 'Blog post not found',
        });
    }

    const isOwnerOrAdmin = user.id === blogPost.authorId || user.isAdmin;
    if (!isOwnerOrAdmin) {
        return APIHelper.createNextResponse({
            success: false,
            status: 403,
            message: 'Forbidden: You are not allowed to delete this blog post',
        });
    }

    try {
        await prisma.blogPost.delete({ where: { id: parseInt(id, 10) } });
        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            message: 'Blog post deleted successfully',
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to delete blog post',
        });
    }
}