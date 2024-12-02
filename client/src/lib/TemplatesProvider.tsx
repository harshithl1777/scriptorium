import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { CodeTemplate, CreateResourceState } from '@/utils/types';
import { useUser } from '@/lib/UserProvider';

type CodeTemplatesContextType = {
    isLoading: boolean;
    getTemplateByID: (id: string) => Promise<CodeTemplate | null>;
    createTemplate: (data: CreateResourceState) => Promise<void>;
    updateTemplate: (template: CodeTemplate) => Promise<CodeTemplate>;
};

const CodeTemplatesContext = createContext<CodeTemplatesContextType | undefined>(undefined);

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, getUserByID } = useUser();

    const getTemplateByID = async (id: string): Promise<CodeTemplate | null> => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/templates/${id}`);
            return response.data.payload;
        } finally {
            setIsLoading(false);
        }
    };

    const createTemplate = async (data: CreateResourceState): Promise<void> => {
        setIsLoading(true);
        try {
            await axios.post('/api/templates', data);
            await getUserByID(user!.id);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTemplate = async (template: CodeTemplate) => {
        setIsLoading(true);
        try {
            const tags = template.tags.map((tag) => tag.name);
            const { title, description, code } = template;
            const response = await axios.put(`/api/templates/${template.id}`, {
                title,
                description,
                code,
                tags,
            });
            return response.data.payload;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CodeTemplatesContext.Provider value={{ isLoading, getTemplateByID, createTemplate, updateTemplate }}>
            {children}
        </CodeTemplatesContext.Provider>
    );
};

export const useTemplates = (): CodeTemplatesContextType => {
    const context = useContext(CodeTemplatesContext);
    if (!context) {
        throw new Error('useCodeTemplates must be used within a CodeTemplatesProvider');
    }
    return context;
};
