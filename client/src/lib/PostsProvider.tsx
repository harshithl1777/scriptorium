import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { BlogPost, CreateResourceState } from '@/utils/types'; // Ensure types are defined

type BlogPostsContextType = {
    blogPosts: BlogPost[] | null;
    isLoading: boolean;
    createBlogPost: (data: CreateResourceState) => Promise<BlogPost>;
};

const BlogPostsContext = createContext<BlogPostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const createBlogPost = async (data: CreateResourceState): Promise<BlogPost> => {
        setIsLoading(true);
        try {
            const { title, description, tags } = data;
            const response = await axios.post('/api/posts', { title, description, tags });
            const createdPost = response.data.blogPost;
            setBlogPosts((prev) => (prev ? [...prev, createdPost] : [createdPost]));
            return createdPost;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BlogPostsContext.Provider value={{ blogPosts, isLoading, createBlogPost }}>
            {children}
        </BlogPostsContext.Provider>
    );
};

export const useBlogPosts = (): BlogPostsContextType => {
    const context = useContext(BlogPostsContext);
    if (!context) {
        throw new Error('useBlogPosts must be used within a BlogPostsProvider');
    }
    return context;
};
