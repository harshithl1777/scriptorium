import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { Tag } from '@/utils/types';

interface TagsContextType {
    tags: { label: string; value: string }[] | null;
    isLoading: boolean;
    fetchTags: () => Promise<void>;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const TagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tags, setTags] = useState<{ label: string; value: string }[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchTags = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/tags');
            const tags = response.data.payload.tags.map((tag: Tag) => ({ label: tag.name, value: tag.name }));
            setTags(tags);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return <TagsContext.Provider value={{ tags, isLoading, fetchTags }}>{children}</TagsContext.Provider>;
};

export const useTags = (): TagsContextType => {
    const context = useContext(TagsContext);
    if (!context) {
        throw new Error('useTag must be used within a TagProvider');
    }
    return context;
};
