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
    blogPosts: BlogPost[];
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

export interface ResourceReport {
    id: number;
    reason: string;
    content: string;
    createdAt: Date;
    reporter: User;
    reporterId: number;
    blogPost?: BlogPost | null;
    blogPostId?: number | null;
    comment?: Comment | null;
    commentId?: number | null;
    type: 'post' | 'comment';
    reportCount: number;
    reports: ReportContent[];
}

export interface UserVote {
    id: number;
    userId: number;
    targetId: number;
    targetType: 'post' | 'comment';
    voteType: 'upvote' | 'downvote';
    user: User;
}

export interface Report {
    id: number;
    createdAt: Date;
    reason: string;
    reporterId: number;
    blogPostId: number | null;
    commentId: number | null;
}

export interface ReportContent {
    id: number;
    reason: string;
    createdAt: string | Date; // You can use Date if you're working with Date objects
    reporterId: number;
    blogPostId: number | null;
    commentId: number | null;
}

export interface CreateUserState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatarURL?: string | null;
    phoneNumber?: string | null;
}

export interface UpdateUserState {
    email: string;
    firstName: string;
    lastName: string;
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

export interface SearchTemplatesState {
    title: string;
    content: string;
    tags: string[];
    language: Language;
}

export interface SearchPostsCommentsState {
    title: string;
    content: string;
    tags: string[];
    include: ('posts' | 'comments')[];
    sort: 'best' | 'controversial';
}

export interface SearchReportsState {
    include: ('posts' | 'comments')[];
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

export interface Pagination {
    totalTemplates: number;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export interface FusedBlogPostComment {
    id: number;
    title?: string;
    description?: string;
    content?: string;
    tags?: Tag[];
    blogPostId?: number;
    type: 'post' | 'comment';
    netUpvotes: number;
    author?: User;
}
