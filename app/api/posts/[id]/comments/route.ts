import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config';
import { APIUtils } from '@/utils';
import { User } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'best';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    try {
        const totalComments = await prisma.comment.count({
            where: { blogPostId: parseInt(id, 10), parentId: null, isHidden: false },
        });

        const comments = await prisma.comment.findMany({
            where: { blogPostId: parseInt(id, 10), parentId: null, isHidden: false },
            include: {
                replies: {
                    include: { author: true },
                },
                author: true,
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        const sortedComments = comments
            .map((comment) => ({
                ...comment,
                netUpvotes: comment.upvotes - comment.downvotes,
                absDifference: Math.abs(comment.upvotes - comment.downvotes),
            }))
            .sort((a, b) => {
                if (sort === 'controversial') {
                    return a.absDifference - b.absDifference;
                }
                return b.netUpvotes - a.netUpvotes;
            });

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: {
                data: sortedComments,
                pagination: {
                    totalComments,
                    page,
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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

    const body = await req.json();
    const { content, parentId } = body;

    if (!content) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'Content is required for a comment',
        });
    }

    if (parentId) {
        const parentComment = await prisma.comment.findUnique({ where: { id: parseInt(parentId, 10) } });
        if (!parentComment) {
            return APIUtils.createNextResponse({
                success: false,
                status: 404,
                message: 'Parent comment not found',
            });
        }
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                content,
                authorId: user.id,
                blogPostId: parseInt(id, 10),
                parentId: parentId ? parseInt(parentId, 10) : null,
            },
        });

        return APIUtils.createNextResponse({
            success: true,
            status: 201,
            payload: newComment,
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
