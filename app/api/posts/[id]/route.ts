import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { APIUtils } from '@/utils';
import { User } from '@prisma/client';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const post = await prisma.blogPost.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                tags: true,
                templates: true,
                author: true,
                reports: true,
                comments: {
                    include: {
                        author: true,
                        reports: true,
                    },
                    orderBy: { upvotes: 'desc' },
                },
            },
        });

        if (!post) {
            return APIUtils.createNextResponse({
                success: false,
                status: 404,
                message: 'Blog post not found',
            });
        }

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: post,
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

    const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id, 10) },
        select: { authorId: true },
    });

    if (!blogPost) {
        return APIUtils.createNextResponse({
            success: false,
            status: 404,
            message: 'Blog post not found',
        });
    }

    const isOwnerOrAdmin = user.id === blogPost.authorId || user.isAdmin;
    if (!isOwnerOrAdmin) {
        return APIUtils.createNextResponse({
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

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: post,
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);
    const postId = parseInt(id, 10);

    // Fetch the blog post with its authorId, related code templates, and comments
    const blogPost = await prisma.blogPost.findUnique({
        where: { id: postId },
        include: { templates: true, comments: true, reports: true }, // Include related code templates and comments
    });

    if (!blogPost) {
        return APIUtils.createNextResponse({
            success: false,
            status: 404,
            message: 'Blog post not found',
        });
    }

    if (user.id !== blogPost.authorId && !user.isAdmin) {
        return APIUtils.createNextResponse({
            success: false,
            status: 403,
            message: 'Forbidden: You are not allowed to delete this blog post',
        });
    }

    try {
        const reportIds = blogPost.reports.map((report) => report.id);
        const commentIds = blogPost.comments.map((comment) => comment.id);

        // Delete all associated comments
        if (commentIds.length > 0) {
            await prisma.comment.deleteMany({
                where: { id: { in: commentIds } },
            });
        }

        if (reportIds.length > 0) {
            await prisma.report.deleteMany({
                where: { id: { in: reportIds } },
            });
        }

        // Disconnect all related code templates
        await prisma.blogPost.update({
            where: { id: postId },
            data: {
                templates: {
                    disconnect: blogPost.templates.map((template) => ({ id: template.id })),
                },
            },
        });

        // Delete the blog post
        await prisma.blogPost.delete({ where: { id: postId } });

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            message: `Blog post deleted successfully. Disconnected ${blogPost.templates.length} code template(s) and deleted ${blogPost.comments.length} comment(s).`,
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();
    const { type } = body;

    try {
        if (!['post', 'comment'].includes(type)) {
            return APIUtils.createNextResponse({
                success: false,
                status: 400,
                message: 'Type must be of post or comment',
            });
        }

        if (type === 'post') {
            await prisma.blogPost.update({
                where: { id: parseInt(id, 10) },
                data: { isHidden: true },
            });
        } else {
            await prisma.comment.update({
                where: { id: parseInt(id, 10) },
                data: { isHidden: true },
            });
        }

        return APIUtils.createNextResponse({ success: true, status: 200 });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() });
    }
}
