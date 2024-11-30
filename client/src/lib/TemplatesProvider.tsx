import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { CodeTemplate, CreateResourceState } from '@/utils/types'; // Ensure types are defined

type CodeTemplatesContextType = {
    codeTemplates: CodeTemplate[] | null;
    isLoading: boolean;
    createCodeTemplate: (data: CreateResourceState) => Promise<CodeTemplate>;
};

const CodeTemplatesContext = createContext<CodeTemplatesContextType | undefined>(undefined);

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [codeTemplates, setCodeTemplates] = useState<CodeTemplate[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const createCodeTemplate = async (data: CreateResourceState): Promise<CodeTemplate> => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/templates', data);
            const createdTemplate = response.data.codeTemplate; // Assuming API returns `codeTemplate`
            setCodeTemplates((prev) => (prev ? [...prev, createdTemplate] : [createdTemplate]));
            return createdTemplate;
        } catch (error) {
            console.error('Error creating code template:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CodeTemplatesContext.Provider value={{ codeTemplates, isLoading, createCodeTemplate }}>
            {children}
        </CodeTemplatesContext.Provider>
    );
};

export const useCodeTemplates = (): CodeTemplatesContextType => {
    const context = useContext(CodeTemplatesContext);
    if (!context) {
        throw new Error('useCodeTemplates must be used within a CodeTemplatesProvider');
    }
    return context;
};
