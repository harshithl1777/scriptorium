export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatarURL?: string | null;
    phoneNumber?: string | null;
    isAdmin: boolean;
    templates: CodeTemplate[];
    blogPosts: BlogPost[];
    comments: Comment[];
    reports: Report[];
    UserVote: UserVote[];
};

export type CodeTemplate = {
    id: number;
    title: string;
    explanation: string;
    code: string;
    language: string;
    createdAt: Date;
    author: User;
    authorId: number;
    forks: CodeTemplate[];
    original?: CodeTemplate | null;
    originalId?: number | null;
    blogPosts: BlogPost[];
    tags: Tag[];
};

export type BlogPost = {
    id: number;
    title: string;
    description: string;
    content: string;
    createdAt: Date;
    author: User;
    authorId: number;
    templates: CodeTemplate[];
    comments: Comment[];
    reports: Report[];
    isHidden: boolean;
    tags: Tag[];
    upvotes: number;
    downvotes: number;
};

export type Tag = {
    id: number;
    name: string;
    codeTemplates: CodeTemplate[];
    blogPosts: BlogPost[];
};

export type Comment = {
    id: number;
    content: string;
    createdAt: Date;
    author: User;
    authorId: number;
    blogPost: BlogPost;
    blogPostId: number;
    parent?: Comment | null;
    parentId?: number | null;
    replies: Comment[];
    reports: Report[];
    isHidden: boolean;
    upvotes: number;
    downvotes: number;
};

export type Report = {
    id: number;
    reason: string;
    createdAt: Date;
    reporter: User;
    reporterId: number;
    blogPost?: BlogPost | null;
    blogPostId?: number | null;
    comment?: Comment | null;
    commentId?: number | null;
};

export type UserVote = {
    id: number;
    userId: number;
    targetId: number;
    targetType: string;
    voteType: string;
    user: User;
};

export interface CreateUserState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatarURL?: string | null;
    phoneNumber?: string | null;
}

export interface CreateSessionState {
    email: string;
    password: string;
}
