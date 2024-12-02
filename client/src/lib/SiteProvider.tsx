import { Language } from '@/utils/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Breadcrumb = {
    label: string;
    path: string;
    language?: Language;
};

interface SiteContextType {
    breadcrumbs: Breadcrumb[];
    updateBreadcrumbs: (newBreadcrumbs: Breadcrumb[]) => void;
}
const SiteContext = createContext<SiteContextType | undefined>(undefined);

interface SiteProviderProps {
    children: ReactNode;
}

export const SiteProvider: React.FC<SiteProviderProps> = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

    const updateBreadcrumbs = (newBreadcrumbs: Breadcrumb[]) => {
        setBreadcrumbs(newBreadcrumbs);
    };

    return <SiteContext.Provider value={{ breadcrumbs, updateBreadcrumbs }}>{children}</SiteContext.Provider>;
};

export const useSite = (): SiteContextType => {
    const context = useContext(SiteContext);
    if (!context) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};
