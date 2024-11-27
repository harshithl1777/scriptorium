// pages/api/reports.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { logError } from '@/utils/helpers';
import { User } from '@prisma/client';
import { APIHelper } from '@/utils/helpers';

export async function GET(req: NextRequest) {
    const userHeader = req.headers.get('x-user');
    const user: User | null = userHeader ? JSON.parse(userHeader) : null;
    const { searchParams } = new URL(req.url);
    const includeParams = searchParams.get('include');
    const include = includeParams ? includeParams.split(',') : ['posts', 'comments'];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!user || !user.isAdmin) {
        return APIHelper.createNextResponse({ success: false, status: 403, message: 'Forbidden: Admin access required' });
    }

    try {
        const includePosts = include.includes('posts');
        const includeComments = include.includes('comments');

        const skip = (page - 1) * limit;

        let reportedContent: Array<any> = [];

        if (includePosts) {
            // Fetch blog posts with report counts and apply pagination
            const posts = await prisma.blogPost.findMany({
                where: { reports: { some: {} } },
                include: {
                    author: true,
                    _count: { select: { reports: true } },
                },
                skip,
                take: limit,
            });

            reportedContent = reportedContent.concat(
                posts.map((post) => ({
                    ...post,
                    reportCount: post._count.reports,
                    type: 'post',
                }))
            );
        }

        if (includeComments) {
            // Fetch comments with report counts and apply pagination
            const comments = await prisma.comment.findMany({
                where: { reports: { some: {} } },
                include: {
                    author: true,
                    _count: { select: { reports: true } },
                },
                skip,
                take: limit,
            });

            reportedContent = reportedContent.concat(
                comments.map((comment) => ({
                    ...comment,
                    reportCount: comment._count.reports,
                    type: 'comment',
                }))
            );
        }

        // Sort the combined array by report count in descending order
        reportedContent.sort((a, b) => b.reportCount - a.reportCount);

        return APIHelper.createNextResponse({
            success: true,
            status: 200,
            payload: {
                data: reportedContent,
                pagination: {
                    page,
                    limit,
                    totalItems: reportedContent.length,
                },
            },
        });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({ success: false, status: 500, message: 'Failed to fetch reported content' });
    }
}

export async function POST(req: NextRequest) {
    const userHeader = req.headers.get('x-user');
    const user: User | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return APIHelper.createNextResponse({ success: false, status: 401, message: 'Unauthorized: User not authenticated' });
    }

    const body = await req.json();
    const { targetType, targetId, reason } = body;

    if (!reason || !targetType || !targetId) {
        return APIHelper.createNextResponse({ success: false, status: 400, message: 'targetType, targetId, and reason are required.' });
    }

    if (!['post', 'comment'].includes(targetType)) {
        return APIHelper.createNextResponse({ success: false, status: 400, message: 'Invalid targetType. Must be "post" or "comment".' });
    }

    const resource = await prisma[targetType === 'post' ? 'blogPost' : 'comment'].findUnique({
        where: { id: parseInt(targetId, 10) },
    });

    if (!resource) {
        return APIHelper.createNextResponse({ success: false, status: 404, message: 'Report target not found' });
    }

    try {
        const reportData: Record<string, any> = {
            reason,
            reporterId: user.id,
            [targetType === 'post' ? 'blogPostId' : 'commentId']: parseInt(targetId, 10),
        };

        const report = await prisma.report.create({
            data: reportData,
        });

        return APIHelper.createNextResponse({ success: true, status: 201, payload: report });
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({ success: false, status: 500, message: 'Failed to create report' });
    }
}