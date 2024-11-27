// pages/api/ratings/comments/[id].ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { logError } from '@/utils/helpers';
import { User } from '@prisma/client';
import { APIHelper } from '@/utils/helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const userHeader = req.headers.get('x-user');
    const user: User | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return APIHelper.createNextResponse({ success: false, status: 401, message: 'Unauthorized: User not authenticated' });
    }

    const comment = await prisma.comment.findUnique({
        where: { id: parseInt(id, 10) },
    });

    if (!comment) {
        return APIHelper.createNextResponse({ success: false, status: 404, message: 'Comment not found' });
    }

    const body = await req.json();
    const { action } = body;

    if (!['upvote', 'downvote'].includes(action)) {
        return APIHelper.createNextResponse({ success: false, status: 400, message: 'Invalid action. Use "upvote" or "downvote"' });
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
            // If the user already voted the same action, return an error
            if (existingVote.voteType === action) {
                return APIHelper.createNextResponse({ success: false, status: 400, message: `You have already ${action}d this comment` });
            }

            // If the user wants to switch vote, update the vote type and adjust counts
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

            return APIHelper.createNextResponse({ success: true, status: 200, payload: updatedComment });
        } else {
            // If no existing vote, create a new vote and increment the relevant count
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

            return APIHelper.createNextResponse({ success: true, status: 200, payload: updatedComment });
        }
    } catch (error) {
        logError(error);
        return APIHelper.createNextResponse({ success: false, status: 500, message: 'Failed to update comment rating' });
    }
}