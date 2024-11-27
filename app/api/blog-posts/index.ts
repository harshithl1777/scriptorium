// pages/api/blog-posts/index.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';
import { logError } from '@/utils/logger';
import { BlogPost, User } from '@prisma/client';
import { APIHelper } from '@/utils/helpers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') || 'best';

    const filters: any = {
        AND: [
            search
                ? {
                      OR: [
                          { title: { contains: search } },
                          { content: { contains: search } },
                          { templates: { some: { title: { contains: search } } } },
                          { tags: { some: { name: { contains: search } } } },
                      ],
                  }
                : {},
            tags ? { tags: { some: { name: { in: tags.split(',') } } } } : {},
            { isHidden: false },
        ],
    };

    try {
        const totalPosts = await prisma.blogPost.count({ where: filters });

        const posts = await prisma.blogPost.findMany({
            where: filters,
            include: { tags: true, templates: true, author: true },
            take: limit,
            skip: (page - 1) * limit,
        });

        const sortedPosts = posts
            .map((post) => ({
                ...post,
                netUpvotes: post.upvotes - post.downvotes,
                absDifference: Math.abs(post.upvotes - post.downvotes),
            }))
            .sort((a, b) => {
                if (sort === 'controversial') {
                    return a.absDifference - b.absDifference;
                }
                return b.netUpvotes - a.netUpvotes;
            });

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: {
                data: sortedPosts,
                pagination: {
                    totalPosts,
                    page,
                    limit,
                },
            },
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to retrieve blog posts',
        });
    }
}

export async function POST(req: NextRequest) {
    const userHeader = req.headers.get('x-user');
    const user: User | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return APIHelper.createNextResponse({
            success: false,
            status: 401,
            message: 'Unauthorized: User not authenticated',
        });
    }

    const body = await req.json();
    const { title, description, content, tags, templateIds = [] } = body;

    try {
        const newPost = await prisma.blogPost.create({
            data: {
                title,
                description,
                content,
                authorId: user.id,
                tags: {
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                templates: {
                    connect: templateIds.map((id: number) => ({ id })),
                },
            },
            include: { tags: true, templates: true },
        });

        return APIHelper.createNextResponse({
            success: true,
            status: 201,
            payload: newPost,
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({
            success: false,
            status: 500,
            message: 'Failed to create blog post',
        });
    }
}