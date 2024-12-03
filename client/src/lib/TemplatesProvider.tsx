import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { CodeTemplate, CreateResourceState, Language, Pagination } from '@/utils/types';
import { useUser } from '@/lib/UserProvider';

type CodeTemplatesContextType = {
    isLoading: boolean;
    pagination: Pagination | null;
    templates: CodeTemplate[];
    searchTemplates: ({
        title,
        content,
        language,
        tags,
        page,
        limit,
    }: {
        title: string;
        content: string;
        language: Language;
        tags: string[];
        page: number;
        limit: number;
    }) => Promise<void>;
    getTemplateByID: (id: string) => Promise<CodeTemplate | null>;
    createTemplate: (data: CreateResourceState) => Promise<void>;
    updateTemplate: (template: CodeTemplate) => Promise<CodeTemplate>;
};

const CodeTemplatesContext = createContext<CodeTemplatesContextType | undefined>(undefined);

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [templates, setTemplates] = useState<CodeTemplate[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user, getUserByID } = useUser();

    const searchTemplates = async ({
        title,
        content,
        language,
        tags,
        page,
        limit,
    }: {
        title: string;
        content: string;
        language: Language;
        tags: string[];
        page: number;
        limit: number;
    }): Promise<void> => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                title,
                content,
                language,
                tags: tags.join(','),
                page: page.toString(),
                limit: limit.toString(),
            });

            const response = await axios.get(`/api/templates?${queryParams.toString()}`);
            const templatesResponse = response.data.payload.templates;
            const paginationResponse = response.data.payload.pagination;
            setPagination(paginationResponse);
            setTemplates(templatesResponse);
        } finally {
            setIsLoading(false);
        }
    };

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
        <CodeTemplatesContext.Provider
            value={{
                isLoading,
                templates,
                pagination,
                searchTemplates,
                getTemplateByID,
                createTemplate,
                updateTemplate,
            }}
        >
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
