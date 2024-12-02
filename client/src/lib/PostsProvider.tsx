import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { BlogPost, CreateResourceState } from '@/utils/types'; // Ensure types are defined
import { useUser } from '@/lib/UserProvider';

type BlogPostsContextType = {
    isLoading: boolean;
    getPostByID: (id: string) => Promise<BlogPost | null>;
    updatePost: (post: BlogPost) => Promise<BlogPost>;
    createPost: (data: CreateResourceState) => Promise<void>;
};

const BlogPostsContext = createContext<BlogPostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, getUserByID } = useUser();

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

    return (
        <BlogPostsContext.Provider value={{ isLoading, getPostByID, updatePost, createPost }}>
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
