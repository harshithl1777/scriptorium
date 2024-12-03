import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { Pagination, ResourceReport } from '@/utils/types'; // Ensure this type is defined

type ReportsContextType = {
    isLoading: boolean;
    reports: ResourceReport[];
    pagination: Pagination | null;
    searchReports: ({
        include,
        page,
        limit,
    }: {
        include: ('posts' | 'comments')[];
        page: number;
        limit: number;
    }) => Promise<void>;
};

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reports, setReports] = useState<ResourceReport[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const searchReports = async ({
        include,
        page,
        limit,
    }: {
        include: ('posts' | 'comments')[];
        page: number;
        limit: number;
    }): Promise<void> => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                include: include.join(','),
                page: page.toString(),
                limit: limit.toString(),
            });

            const response = await axios.get(`/api/reports?${queryParams.toString()}`);
            const reportsResponse = response.data.payload.data;
            const paginationResponse = response.data.payload.pagination;
            setReports(reportsResponse);
            setPagination(paginationResponse);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ReportsContext.Provider value={{ isLoading, reports, pagination, searchReports }}>
            {children}
        </ReportsContext.Provider>
    );
};

export const useReports = (): ReportsContextType => {
    const context = useContext(ReportsContext);
    if (!context) {
        throw new Error('useReports must be used within a ReportsProvider');
    }
    return context;
};
