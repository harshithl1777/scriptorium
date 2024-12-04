'use client';

import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Code2Icon, GitFork, Loader2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeTemplate, Language, SearchTemplatesState } from '@/utils/types';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { generateEmptyStringObject } from '@/utils/common';
import TagsSelector from '@/components/tags-selector';
import { useTemplates } from '@/lib/TemplatesProvider';
import { useToast } from '@/hooks/use-toast';
import { useTags } from '@/lib/TagsProvider';
import { LANGUAGES } from '@/utils/constants';
import { MultiSelect } from '@/components/ui/multi-select';

export const columns: ColumnDef<CodeTemplate>[] = [
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
            <div className=''>
                <Tooltip>
                    <TooltipTrigger className='p-2 rounded-md bg-blue-600'>
                        <Code2Icon className='text-white dark:text-slate-900' size={16} />
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>Code Template</TooltipContent>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
            <div
                className='hover:underline hover:underline-offset-4 hover:cursor-pointer flex flex-row gap-2'
                onClick={() => window.open('/templates/' + row.original.id)}
            >
                {row.original.originalId !== null && (
                    <Tooltip>
                        <TooltipTrigger>
                            <GitFork size={16} className='!mt-[1px] text-slate-400' />
                        </TooltipTrigger>
                        <TooltipContent side='bottom'>Forked Template</TooltipContent>
                    </Tooltip>
                )}
                {row.getValue('title')}
            </div>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => <div>{row.getValue('description')}</div>,
    },
    {
        accessorKey: 'language', // New Language column
        header: 'Language',
        cell: ({ row }) => <div>{row.getValue('language')}</div>, // Display the language
    },
    {
        accessorKey: 'tags',
        header: () => <div>Tags</div>,
        cell: ({ row }) => {
            const templateID = row.original.id;
            const tags = row.original.tags;
            return (
                <div className='text-right font-medium flex flex-row gap-2 items-center'>
                    {tags.slice(0, 2).map((tag) => (
                        <Badge
                            className='font-normal hover:bg-blue-600 dark:hover:bg-blue-800 bg-blue-600 dark:bg-blue-800'
                            key={templateID + tag.id}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                    {tags.length > 2 && (
                        <HoverCard>
                            <HoverCardTrigger>+{tags.length - 2}</HoverCardTrigger>
                            <HoverCardContent className='rounded-lg flex flex-row w-fit gap-2 items-center justify-center max-w-[300px] h-fit flex-wrap'>
                                {tags.map((tag) => (
                                    <Badge
                                        className='font-normal w-fit hover:bg-blue-600 dark:hover:bg-blue-800 bg-blue-600 dark:bg-blue-800'
                                        key={templateID + tag.id}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>
            );
        },
    },
];

const initialState = generateEmptyStringObject(['title', 'content', 'language']) as {
    title: string;
    content: string;
    language: Language;
    tags: string[];
};

export function TemplatesTable() {
    const [dialogState, setDialogState] = React.useState<{ open: boolean }>({
        open: false,
    });
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pageIndex, setPageIndex] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);
    const [searchState, setSearchState] = React.useState<SearchTemplatesState>({
        ...initialState,
        tags: [],
    });

    const { tags, fetchTags } = useTags();
    const { isLoading: templatesLoading, templates, pagination, searchTemplates } = useTemplates();
    const { toast } = useToast();

    const table = useReactTable({
        data: templates,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    React.useEffect(() => {
        const conditionallyFetchResources = async () => {
            if (!tags) await fetchTags();
            if (templates.length === 0) await searchTemplates({ ...searchState, page: pageIndex, limit: pageSize });
        };

        conditionallyFetchResources();
    }, []);

    const refetchResults = async (newPageIndex: number, newPageSize?: number) => {
        await searchTemplates({ ...searchState, page: newPageIndex, limit: newPageSize || pageSize });
    };

    return (
        <div className='w-full'>
            <div className='flex items-center py-4 gap-2'>
                <div className='w-fit flex items-center py-4 flex-row gap-2'>
                    <Input
                        placeholder='Filter by title...'
                        value={searchState.title}
                        onChange={(e) => setSearchState({ ...searchState, title: e.target.value })}
                        className='w-[250px] focus:!ring-blue-800'
                    />
                    <Input
                        placeholder='Filter by description...'
                        value={searchState.content}
                        onChange={(e) => setSearchState({ ...searchState, content: e.target.value })}
                        className='w-[250px] focus:!ring-blue-800'
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                className='hover:bg-blue-600 dark:text-slate-400 dark:hover:text-white'
                            >
                                {searchState.language || 'Language'} <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {(LANGUAGES as Language[]).map((language) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={language}
                                        className='capitalize hover:!bg-blue-600'
                                        checked={searchState.language === language}
                                        onClick={() => {
                                            setSearchState({ ...searchState, language });
                                        }}
                                    >
                                        {language}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {tags && (
                        <MultiSelect
                            options={tags}
                            placeholder='Filter by tags'
                            maxCount={0}
                            variant='secondary'
                            onValueChange={(tags) => setSearchState({ ...searchState, tags })}
                        />
                    )}
                </div>
                <div className='w-fit flex items-center py-4 flex-row gap-2 ml-auto'>
                    <Button
                        className='bg-blue-600 hover:bg-blue-500 h-[38px] dark:text-slate-900 ml-6'
                        onClick={() => {
                            setPageIndex(() => {
                                const newPageIndex = 1;
                                refetchResults(newPageIndex, pageSize);
                                return newPageIndex;
                            });
                            return pageSize;
                        }}
                        disabled={templatesLoading}
                    >
                        {templatesLoading ? <Loader2 className='animate-spin' /> : <Search />}
                        {templatesLoading ? 'Searching' : 'Search'}
                    </Button>
                </div>
            </div>
            <div className='rounded-md border max-h-[500px] overflow-y-auto'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {templatesLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    {[1, 2, 3, 4, 5, 6].map((_) => (
                                        <Skeleton className='bg-slate-800 w-full h-10 mb-2' key={_} />
                                    ))}
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    No results
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-end space-x-2 py-4'>
                <div className='flex-1 text-sm text-muted-foreground'>
                    {pagination && (
                        <>
                            Results {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalTemplates)} of{' '}
                            {pagination.totalTemplates} total results.
                        </>
                    )}
                </div>
                <div className='space-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                className='hover:bg-blue-600 dark:text-slate-400 dark:hover:text-white'
                            >
                                {pageSize} rows <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {[5, 10, 15, 20, 25].map((size) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={size}
                                        className='capitalize hover:!bg-blue-600'
                                        checked={pageSize === size}
                                        onClick={() => {
                                            setPageSize(() => {
                                                const newSize = size;
                                                setPageIndex(() => {
                                                    const newPageIndex = 1;
                                                    refetchResults(newPageIndex, newSize);
                                                    return newPageIndex;
                                                });
                                                return newSize;
                                            });
                                        }}
                                    >
                                        {size}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-10 hover:bg-blue-800'
                        onClick={() => {
                            setPageIndex((pageIndex) => {
                                const newPageIndex = pageIndex - 1;
                                refetchResults(newPageIndex);
                                return newPageIndex;
                            });
                        }}
                        disabled={!pagination || pagination.currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-10 hover:bg-blue-800'
                        onClick={() => {
                            setPageIndex((pageIndex) => {
                                const newPageIndex = pageIndex + 1;
                                refetchResults(newPageIndex);
                                return newPageIndex;
                            });
                        }}
                        disabled={!pagination || pagination.currentPage === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
