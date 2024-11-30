import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { BlogPost, CodeTemplate, CreateUserState, User } from '@/utils/types';

type UserContextType = {
    user: User | null;
    isLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    createUser: (args: CreateUserState) => Promise<void>;
    getUserByID: (id: number) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const formatData = (user: User) => {
        const templates = user
            ? user.templates.map((template: CodeTemplate) => ({
                  ...template,
                  type: 'Code Template',
                  description: template.description,
              }))
            : [];

        const posts = user ? user.blogPosts.map((post: BlogPost) => ({ ...post, type: 'Blog Post' })) : [];
        user.resources = [...templates, ...posts];
        return user;
    };

    const getUserByID = async (id: number) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/users/${id}`);
            setUser(formatData(response.data.payload));
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const createUser = async (args: CreateUserState) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`/api/users`, { ...args });
            setUser(formatData(response.data.payload));
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, isLoading, setUser, createUser, getUserByID }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
