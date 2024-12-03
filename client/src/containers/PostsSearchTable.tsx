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
import { ChevronDown, Loader2, ReplyIcon, Search, TextCursorIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FusedBlogPostComment, SearchPostsCommentsState } from '@/utils/types';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { generateEmptyStringObject } from '@/utils/common';
import { useToast } from '@/hooks/use-toast';
import { useTags } from '@/lib/TagsProvider';
import { MultiSelect } from '@/components/ui/multi-select-green';
import { usePosts } from '@/lib/PostsProvider';

export const columns: ColumnDef<FusedBlogPostComment>[] = [
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
            <div className=''>
                <Tooltip>
                    <TooltipTrigger
                        className={
                            row.getValue('type') === 'post'
                                ? 'p-2 rounded-md bg-emerald-600'
                                : 'p-2 rounded-md bg-lime-600'
                        }
                    >
                        {row.getValue('type') === 'post' ? (
                            <TextCursorIcon className='text-white dark:text-slate-900' size={16} />
                        ) : (
                            <ReplyIcon className='text-white dark:text-slate-900' size={16} />
                        )}
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='capitalize'>
                        {row.getValue('type')}
                    </TooltipContent>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'title',
        header: 'Title / Commenter',
        cell: ({ row }) => (
            <div
                className='hover:cursor-pointer flex flex-row gap-2 max-w-[300px]'
                onClick={() => window.open('/posts/' + row.original.id)}
            >
                {row.getValue('type') === 'post' ? (
                    <p className='hover:underline hover:underline-offset-4 '>{row.getValue('title')}</p>
                ) : (
                    <div className='flex flex-col gap-[1px]'>
                        {row.original.author?.firstName + ' ' + row.original.author?.lastName}
                        <span className='text-slate-400'>{row.original.author?.email}</span>
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'id',
        header: 'Description / Content',
        cell: ({ row }) => (
            <div className='max-w-[300px]'>
                {row.getValue('type') === 'post' ? row.original.description : row.original.content}
            </div>
        ),
    },
    {
        accessorKey: 'tags',
        header: () => <div>Tags</div>,
        cell: ({ row }) => {
            const postID = row.original.id;
            const tags = row.original.tags;
            return (
                <div className='text-right font-medium flex flex-row gap-2 items-center'>
                    {tags &&
                        tags.slice(0, 2).map((tag) => (
                            <Badge
                                className='font-normal hover:bg-emerald-600 dark:hover:bg-emerald-800 bg-emerald-600 dark:bg-emerald-800'
                                key={postID + tag.id}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    {tags && tags.length > 2 && (
                        <HoverCard>
                            <HoverCardTrigger>+{tags.length - 2}</HoverCardTrigger>
                            <HoverCardContent className='rounded-lg flex flex-row w-fit gap-2 items-center justify-center max-w-[300px] h-fit flex-wrap'>
                                {tags.map((tag) => (
                                    <Badge
                                        className='font-normal w-fit hover:bg-emerald-600 dark:hover:bg-emerald-800 bg-emerald-600 dark:bg-emerald-800'
                                        key={postID + tag.id}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </HoverCardContent>
                        </HoverCard>
                    )}
                    {!tags && <p className='text-slate-400'>N/A</p>}
                </div>
            );
        },
    },
    {
        accessorKey: 'netUpvotes',
        header: 'Net Upvotes',
        cell: ({ row }) => <div className='text-teal-600'>{row.getValue('netUpvotes')}</div>,
    },
];

const initialState = generateEmptyStringObject(['title', 'content']) as {
    title: string;
    content: string;
    tags: string[];
};

export function PostsTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pageIndex, setPageIndex] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);
    const [searchState, setSearchState] = React.useState<SearchPostsCommentsState>({
        ...initialState,
        include: ['posts', 'comments'],
        sort: 'best',
        tags: [],
    });

    const { tags, fetchTags } = useTags();
    const { isLoading: postsLoading, posts, pagination, searchPosts } = usePosts();
    const { toast } = useToast();

    const table = useReactTable({
        data: posts,
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
            if (posts.length === 0) await searchPosts({ ...searchState, page: pageIndex, limit: pageSize });
        };

        conditionallyFetchResources();
    }, []);

    console.log(posts);

    const refetchResults = async (newPageIndex: number, newPageSize?: number) => {
        await searchPosts({ ...searchState, page: newPageIndex, limit: newPageSize || pageSize });
    };

    return (
        <div className='w-full'>
            <div className='flex items-center py-4 gap-2'>
                <div className='w-fit flex items-center py-4 flex-row gap-2'>
                    {searchState.include.includes('posts') && (
                        <Input
                            placeholder='Filter by title...'
                            value={searchState.title}
                            onChange={(e) => setSearchState({ ...searchState, title: e.target.value })}
                            className='w-[250px] focus:!ring-emerald-800'
                        />
                    )}
                    <Input
                        placeholder='Filter by description / content...'
                        value={searchState.content}
                        onChange={(e) => setSearchState({ ...searchState, content: e.target.value })}
                        className='w-[250px] focus:!ring-emerald-800'
                    />
                    {tags && searchState.include.includes('posts') && (
                        <MultiSelect
                            options={tags}
                            placeholder='Filter by tags'
                            maxCount={0}
                            variant='secondary'
                            onValueChange={(tags) => setSearchState({ ...searchState, tags })}
                        />
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                className='hover:bg-emerald-600 dark:text-slate-400 dark:hover:text-white'
                            >
                                Include {searchState.include.length === 2 ? 'Posts & Comments' : searchState.include}{' '}
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {[
                                { label: 'Posts', value: ['posts'] },
                                { label: 'Comments', value: ['comments'] },
                                { label: 'Both', value: ['posts', 'comments'] },
                            ].map(({ label, value }) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={label}
                                        className='capitalize hover:!bg-emerald-600'
                                        checked={
                                            searchState.include.length === 1
                                                ? value.length === 1 && searchState.include[0] === value[0]
                                                : value.length === 2
                                        }
                                        onClick={() => {
                                            setSearchState({
                                                ...searchState,
                                                include: value as ('posts' | 'comments')[],
                                            });
                                        }}
                                    >
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                className='hover:bg-emerald-600 dark:text-slate-400 dark:hover:text-white capitalize'
                            >
                                {searchState.sort}
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {['best', 'controversial'].map((value) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={value}
                                        className='capitalize hover:!bg-emerald-600'
                                        checked={searchState.sort === value}
                                        onClick={() => {
                                            setSearchState({
                                                ...searchState,
                                                sort: value as 'best' | 'controversial',
                                            });
                                        }}
                                    >
                                        {value}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className='w-fit flex items-center py-4 flex-row gap-2 ml-auto'>
                    <Button
                        className='bg-emerald-600 hover:bg-emerald-500 h-[38px] dark:text-slate-900 ml-6'
                        onClick={() => {
                            setPageIndex(() => {
                                const newPageIndex = 1;
                                refetchResults(newPageIndex, pageSize);
                                return newPageIndex;
                            });
                            return pageSize;
                        }}
                        disabled={postsLoading}
                    >
                        {postsLoading ? <Loader2 className='animate-spin' /> : <Search />}
                        {postsLoading ? 'Searching' : 'Search'}
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
                        {postsLoading ? (
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
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
                            {pagination.totalItems} total results.
                        </>
                    )}
                </div>
                <div className='space-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                className='hover:bg-emerald-600 dark:text-slate-400 dark:hover:text-white'
                            >
                                {pageSize} rows <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {[5, 10, 15, 20, 25].map((size) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={size}
                                        className='capitalize hover:!bg-emerald-600'
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
                        className='h-10 hover:bg-emerald-600'
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
                        className='h-10 hover:bg-emerald-600'
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
