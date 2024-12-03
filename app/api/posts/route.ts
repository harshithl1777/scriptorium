import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { APIUtils } from '@/utils';
import { User } from '@prisma/client';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const title = url.searchParams.get('title');
    const tags = url.searchParams.get('tags');
    const content = url.searchParams.get('content');
    const sort = url.searchParams.get('sort') || 'best';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const includeParam = url.searchParams.get('include');

    const includePosts = !includeParam || includeParam.includes('post');
    const includeComments = !includeParam || includeParam.includes('comment');

    const postFilters = {
        AND: [
            title ? { title: { contains: title } } : {},
            content
                ? {
                      OR: [{ description: { contains: content } }, { content: { contains: content } }],
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
        ],
    };

    const commentFilters = {
        AND: [title ? { title: { contains: title } } : {}, content ? { content: { contains: content } } : {}],
    };

    try {
        const [totalPosts, totalComments, posts, comments] = await Promise.all([
            includePosts ? prisma.blogPost.count({ where: postFilters }) : Promise.resolve(0),
            includeComments ? prisma.comment.count({ where: commentFilters }) : Promise.resolve(0),
            includePosts
                ? prisma.blogPost.findMany({
                      where: postFilters,
                      include: { tags: true, templates: true, author: true },
                  })
                : Promise.resolve([]),
            includeComments
                ? prisma.comment.findMany({
                      where: commentFilters,
                      include: { author: true },
                  })
                : Promise.resolve([]),
        ]);

        // Combine results
        const combinedResults = [
            ...posts.map((post: any) => ({
                ...post,
                type: 'post',
                netUpvotes: post.upvotes - post.downvotes,
                absDifference: Math.abs(post.upvotes - post.downvotes),
            })),
            ...comments.map((comment: any) => ({
                ...comment,
                type: 'comment',
                netUpvotes: comment.upvotes - comment.downvotes,
                absDifference: Math.abs(comment.upvotes - comment.downvotes),
            })),
        ];

        // Sort combined results
        const sortedResults = combinedResults.sort((a, b) => {
            if (sort === 'controversial') {
                return a.absDifference - b.absDifference;
            }
            return b.netUpvotes - a.netUpvotes;
        });

        const startIndex = (page - 1) * limit;
        const paginatedResults = sortedResults.slice(startIndex, startIndex + limit);

        const totalPages = Math.ceil(sortedResults.length / limit);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: {
                data: paginatedResults,
                pagination: {
                    totalItems: totalPosts + totalComments,
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

export async function POST(req: NextRequest) {
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

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

        return APIUtils.createNextResponse({
            success: true,
            status: 201,
            payload: newPost,
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
