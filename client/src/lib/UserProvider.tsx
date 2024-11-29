import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { CreateUserState, User } from '@/utils/types';

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

    const getUserByID = async (id: number) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/users/${id}`);
            setUser(response.data.payload);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const createUser = async (args: CreateUserState) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`/api/users`, { ...args });
            setUser(response.data.payload);
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
