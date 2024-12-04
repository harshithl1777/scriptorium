import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { APIUtils } from '@/utils';
import { User } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

    const comment = await prisma.comment.findUnique({
        where: { id: parseInt(id, 10) },
    });

    if (!comment) {
        return APIUtils.createNextResponse({ success: false, status: 404, message: 'Comment not found' });
    }

    const body = await req.json();
    const { action } = body;

    if (!['upvote', 'downvote'].includes(action)) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'Invalid action. Use "upvote" or "downvote"',
        });
    }

    try {
        // Check if the user has already voted on this comment
        const existingVote = await prisma.userVote.findUnique({
            where: {
                userId_targetId_targetType: {
                    userId: user.id,
                    targetId: parseInt(id, 10),
                    targetType: 'comment',
                },
            },
        });

        if (existingVote) {
            if (existingVote.voteType === action) {
                return APIUtils.createNextResponse({
                    success: false,
                    status: 400,
                    message: `You have already ${action}d this comment`,
                });
            }

            await prisma.userVote.update({
                where: { id: existingVote.id },
                data: { voteType: action },
            });

            const incrementField = action === 'upvote' ? 'upvotes' : 'downvotes';
            const decrementField = action === 'upvote' ? 'downvotes' : 'upvotes';

            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(id, 10) },
                data: {
                    [incrementField]: { increment: 1 },
                    [decrementField]: { decrement: 1 },
                },
            });

            return APIUtils.createNextResponse({ success: true, status: 200, payload: updatedComment });
        } else {
            await prisma.userVote.create({
                data: {
                    userId: user.id,
                    targetId: parseInt(id, 10),
                    targetType: 'comment',
                    voteType: action,
                },
            });

            const incrementField = action === 'upvote' ? 'upvotes' : 'downvotes';

            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(id, 10) },
                data: {
                    [incrementField]: { increment: 1 },
                },
            });

            return APIUtils.createNextResponse({ success: true, status: 200, payload: updatedComment });
        }
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: error.toString(),
        });
    }
}
