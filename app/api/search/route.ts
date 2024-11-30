// app/api/search/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/config';
import { APIUtils } from '@/utils';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const tagList = tags ? tags.split(',') : [];

    try {
        let data: any[] = [];
        let totalResults = 0;

        // Initialize filters
        const baseFilters: any = {
            AND: [
                search
                    ? {
                          OR: [
                              { title: { contains: search } },
                              { content: { contains: search } },
                              { explanation: { contains: search } },
                              { code: { contains: search } },
                          ],
                      }
                    : {},
                tags
                    ? {
                          tags: {
                              some: {
                                  name: { in: tagList },
                              },
                          },
                      }
                    : {},
            ],
        };

        // Fetch BlogPosts
        if (type === 'blog' || !type) {
            const blogFilters = {
                ...baseFilters,
                AND: [...baseFilters.AND, { isHidden: false }],
            };

            const totalBlogs = await prisma.blogPost.count({ where: blogFilters });

            const blogs = await prisma.blogPost.findMany({
                where: blogFilters,
                include: { tags: true, templates: true, author: true },
                take: limit,
                skip: (page - 1) * limit,
            });

            data.push(
                ...blogs.map((post) => ({
                    ...post,
                    resourceType: 'blog',
                }))
            );

            totalResults += totalBlogs;
        }

        // Fetch CodeTemplates
        if (type === 'template' || !type) {
            const templateFilters = baseFilters;

            const totalTemplates = await prisma.codeTemplate.count({ where: templateFilters });

            const templates = await prisma.codeTemplate.findMany({
                where: templateFilters,
                include: { tags: true, author: true },
                take: limit,
                skip: (page - 1) * limit,
            });

            data.push(
                ...templates.map((template) => ({
                    ...template,
                    resourceType: 'template',
                }))
            );

            totalResults += totalTemplates;
        }

        // You can add more resources like Comments if needed

        // Sort combined data (e.g., by creation date descending)
        data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Paginate the combined data
        const paginatedData = data.slice(0, limit);

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: {
                data: paginatedData,
                pagination: {
                    totalResults,
                    page,
                    limit,
                },
            },
        });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({
            success: false,
            status: 500,
            message: error.message || 'An error occurred during search.',
        });
    }
}