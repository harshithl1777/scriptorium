import { User, CodeTemplate, BlogPost, Tag, Comment, Report, UserVote } from '@prisma/client';

export type Model = User | CodeTemplate | BlogPost | Tag | Comment | Report | UserVote;
