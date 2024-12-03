import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { APIUtils } from '@/utils';
import { Report, User } from '@prisma/client';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const includeParams = searchParams.get('include');
    const include = includeParams ? includeParams.split(',') : ['posts', 'comments'];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    try {
        const includePosts = include.includes('posts');
        const includeComments = include.includes('comments');

        let posts: any[] = [];
        let comments: any[] = [];

        if (includePosts) {
            posts = await prisma.blogPost.findMany({
                where: {
                    reports: { some: {} },
                    isHidden: false, // Exclude hidden posts
                },
                include: {
                    author: true,
                    reports: true, // Include reports to get reasons
                    _count: { select: { reports: true } },
                },
            });
        }

        if (includeComments) {
            comments = await prisma.comment.findMany({
                where: {
                    reports: { some: {} },
                    isHidden: false, // Exclude hidden comments
                },
                include: {
                    author: true,
                    reports: true, // Include reports to get reasons
                    _count: { select: { reports: true } },
                },
            });
        }

        // Merge posts and comments, marking their types
        let reportedContent = [
            ...posts.map((post) => ({
                ...post,
                reportCount: post._count.reports,
                type: 'post',
            })),
            ...comments.map((comment) => ({
                ...comment,
                reportCount: comment._count.reports,
                type: 'comment',
            })),
        ];

        // Sort by report count descending
        reportedContent.sort((a, b) => b.reportCount - a.reportCount);

        // Calculate total items for pagination
        const totalItems = reportedContent.length;

        // Apply pagination
        const paginatedContent = reportedContent.slice((page - 1) * limit, page * limit);

        const totalPages = Math.ceil(totalItems / limit);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: {
                data: paginatedContent,
                pagination: { totalPages, currentPage: page, limit, totalItems },
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
    const { targetType, targetId, reason } = body;

    if (!reason || !targetType || !targetId) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'targetType, targetId, and reason are required.',
        });
    }

    if (!['post', 'comment'].includes(targetType)) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'Invalid targetType. Must be "post" or "comment".',
        });
    }

    let resource;
    if (targetType === 'post') {
        resource = await prisma.blogPost.findUnique({
            where: { id: parseInt(targetId, 10) },
        });
    } else {
        resource = await prisma.comment.findUnique({
            where: { id: parseInt(targetId, 10) },
        });
    }

    if (!resource) {
        return APIUtils.createNextResponse({ success: false, status: 404, message: 'Report target not found' });
    }

    try {
        const reportData = {
            reason,
            reporterId: user.id,
            [targetType === 'post' ? 'blogPostId' : 'commentId']: parseInt(targetId, 10),
        };

        const report = await prisma.report.create({
            data: reportData,
        });

        return APIUtils.createNextResponse({ success: true, status: 201, payload: report });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() });
    }
}
