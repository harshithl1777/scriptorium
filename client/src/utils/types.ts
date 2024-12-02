export interface User {
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
    resources: (CodeTemplate | BlogPost)[];
    comments: Comment[];
    reports: Report[];
    UserVote: UserVote[];
    upvotes: {
        post: number[];
        comment: number[];
    };
    downvotes: {
        post: number[];
        comment: number[];
    };
    condensedReports: {
        post: number[];
        comment: number[];
    };
}

export interface CodeTemplate {
    id: number;
    title: string;
    description: string;
    code: string;
    language: string;
    createdAt: Date;
    author: User;
    authorId: number;
    originalId?: number | null;
    tags: Tag[];
}

export interface BlogPost {
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
}

export interface Tag {
    id: number;
    name: string;
    codeTemplates: CodeTemplate[];
    blogPosts: BlogPost[];
}

export interface Comment {
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
}

export interface Report {
    id: number;
    reason: string;
    createdAt: Date;
    reporter: User;
    reporterId: number;
    blogPost?: BlogPost | null;
    blogPostId?: number | null;
    comment?: Comment | null;
    commentId?: number | null;
}

export interface UserVote {
    id: number;
    userId: number;
    targetId: number;
    targetType: 'post' | 'comment';
    voteType: 'upvote' | 'downvote';
    user: User;
}

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

export interface CreateResourceState {
    title: string;
    description: string;
    tags: string[];
    language: string;
}

export interface UpdatePostState {
    title: string;
    description: string;
    content: string;
    tags: string[];
    templateIds: string[];
    upvotes: number;
    downvotes: number;
}

export type Language =
    | 'C'
    | 'C++'
    | 'Python'
    | 'Java'
    | 'JavaScript'
    | 'PHP'
    | 'Go'
    | 'Swift'
    | 'Ruby'
    | 'Rust'
    | 'Markdown';
