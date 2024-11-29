import { User, CodeTemplate, BlogPost, Tag, Comment, Report, UserVote } from '@prisma/client';

export interface Session {
    accessToken: string;
}

export type Model = User | CodeTemplate | BlogPost | Tag | Comment | Report | UserVote | Session;

export interface ExtendedBlogPost extends BlogPost {
    absDifference: number;
    netUpvotes: number;
}
