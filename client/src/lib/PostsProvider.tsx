import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { BlogPost, CreateResourceState, FusedBlogPostComment, Pagination } from '@/utils/types'; // Ensure types are defined
import { useUser } from '@/lib/UserProvider';

type BlogPostsContextType = {
    isLoading: boolean;
    posts: FusedBlogPostComment[];
    pagination: Pagination | null;
    searchPosts: ({
        title,
        content,
        tags,
        sort,
        include,
        page,
        limit,
    }: {
        title: string;
        content: string;
        tags: string[];
        sort: 'best' | 'controversial';
        include: ('posts' | 'comments')[];
        page: number;
        limit: number;
    }) => Promise<void>;
    getPostByID: (id: string) => Promise<BlogPost | null>;
    updatePost: (post: BlogPost) => Promise<BlogPost>;
    createPost: (data: CreateResourceState) => Promise<void>;
    hidePostByID: (id: number, type: 'post' | 'comment') => Promise<void>;
};

const BlogPostsContext = createContext<BlogPostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<FusedBlogPostComment[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user, getUserByID } = useUser();

    const searchPosts = async ({
        title,
        content,
        tags,
        sort,
        include,
        page,
        limit,
    }: {
        title: string;
        content: string;
        tags: string[];
        sort: 'best' | 'controversial';
        include: ('posts' | 'comments')[];
        page: number;
        limit: number;
    }): Promise<void> => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                title,
                content,
                sort,
                include: include.join(','),
                tags: tags.join(','),
                page: page.toString(),
                limit: limit.toString(),
            });

            const response = await axios.get(`/api/posts?${queryParams.toString()}`);
            const postsResponse = response.data.payload.data;
            const paginationResponse = response.data.payload.pagination;
            setPagination(paginationResponse);
            setPosts(postsResponse);
        } finally {
            setIsLoading(false);
        }
    };

    const getPostByID = async (id: string): Promise<BlogPost | null> => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/posts/${id}`);
            return response.data.payload;
        } catch {
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createPost = async (data: CreateResourceState): Promise<void> => {
        setIsLoading(true);
        try {
            const { title, description, tags } = data;
            await axios.post('/api/posts', { title, description, tags });
            await getUserByID(user!.id);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePost = async (post: BlogPost) => {
        setIsLoading(true);
        try {
            const templateIds = post.templates.map((template) => template.id);
            const tags = post.tags.map((tag) => tag.name);
            const { title, description, content, upvotes, downvotes } = post;
            const response = await axios.put(`/api/posts/${post.id}`, {
                title,
                description,
                content,
                tags,
                templateIds,
                upvotes,
                downvotes,
            });
            return response.data.payload;
        } finally {
            setIsLoading(false);
        }
    };

    const hidePostByID = async (id: number, type: 'post' | 'comment'): Promise<void> => {
        setIsLoading(true);
        try {
            await axios.patch(`/api/posts/${id}`, { type });
            setPosts((prevPosts) => prevPosts.map((post) => (post.id === id ? { ...post, isHidden: true } : post)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BlogPostsContext.Provider
            value={{ isLoading, posts, pagination, searchPosts, getPostByID, updatePost, createPost, hidePostByID }}
        >
            {children}
        </BlogPostsContext.Provider>
    );
};

export const usePosts = (): BlogPostsContextType => {
    const context = useContext(BlogPostsContext);
    if (!context) {
        throw new Error('useBlogPosts must be used within a BlogPostsProvider');
    }
    return context;
};
