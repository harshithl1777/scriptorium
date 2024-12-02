import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { User } from '@prisma/client';
import { APIUtils } from '@/utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const userHeader = req.headers.get('x-user');
    const user: User = JSON.parse(userHeader as string);

    const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id, 10) },
    });

    if (!post) {
        return APIUtils.createNextResponse({ success: false, status: 404, message: 'Post not found' });
    }

    const body = await req.json();
    const { action } = body;

    if (!['upvote', 'downvote', 'deupvote', 'dedownvote'].includes(action)) {
        return APIUtils.createNextResponse({
            success: false,
            status: 400,
            message: 'Invalid action. Use "upvote", "downvote", "deupvote", or "dedownvote"',
        });
    }

    try {
        const existingVote = await prisma.userVote.findUnique({
            where: {
                userId_targetId_targetType: {
                    userId: user.id,
                    targetId: parseInt(id, 10),
                    targetType: 'post',
                },
            },
        });

        if (['deupvote', 'dedownvote'].includes(action)) {
            const targetVoteType = action === 'deupvote' ? 'upvote' : 'downvote';

            // If no existing vote or mismatched vote type, return error
            if (!existingVote || existingVote.voteType !== targetVoteType) {
                return APIUtils.createNextResponse({
                    success: false,
                    status: 400,
                    message: `Cannot ${action} a post you haven't ${targetVoteType}d`,
                });
            }

            // Delete the vote and decrement the corresponding field
            await prisma.userVote.delete({ where: { id: existingVote.id } });

            const decrementField = targetVoteType === 'upvote' ? 'upvotes' : 'downvotes';

            const updatedPost = await prisma.blogPost.update({
                where: { id: parseInt(id, 10) },
                data: {
                    [decrementField]: { decrement: 1 },
                },
            });

            return APIUtils.createNextResponse({ success: true, status: 200, payload: updatedPost });
        }

        if (existingVote) {
            if (existingVote.voteType === action) {
                return APIUtils.createNextResponse({
                    success: false,
                    status: 400,
                    message: `You have already ${action}d this post`,
                });
            }

            await prisma.userVote.update({
                where: { id: existingVote.id },
                data: { voteType: action },
            });

            const incrementField = action === 'upvote' ? 'upvotes' : 'downvotes';
            const decrementField = action === 'upvote' ? 'downvotes' : 'upvotes';

            const updatedPost = await prisma.blogPost.update({
                where: { id: parseInt(id, 10) },
                data: {
                    [incrementField]: { increment: 1 },
                    [decrementField]: { decrement: 1 },
                },
            });

            return APIUtils.createNextResponse({ success: true, status: 200, payload: updatedPost });
        } else {
            await prisma.userVote.create({
                data: {
                    userId: user.id,
                    targetId: parseInt(id, 10),
                    targetType: 'post',
                    voteType: action,
                },
            });

            const incrementField = action === 'upvote' ? 'upvotes' : 'downvotes';

            const updatedPost = await prisma.blogPost.update({
                where: { id: parseInt(id, 10) },
                data: {
                    [incrementField]: { increment: 1 },
                },
            });

            return APIUtils.createNextResponse({ success: true, status: 200, payload: updatedPost });
        }
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() });
    }
}
