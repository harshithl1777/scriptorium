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
import { ChevronDown, Eye, Loader2, MoreHorizontal, ReplyIcon, Search, ShieldBan, TextCursorIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
    TableFooter,
} from '@/components/ui/table';
import { Report, ReportContent, ResourceReport, SearchReportsState } from '@/utils/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useReports } from '@/lib/ReportsProvider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import dayjs from 'dayjs';
import { usePosts } from '@/lib/PostsProvider';

export function ReportsTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pageIndex, setPageIndex] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(5);
    const [searchState, setSearchState] = React.useState<SearchReportsState>({
        include: ['posts', 'comments'],
    });
    const [dialogState, setDialogState] = React.useState<{
        open: boolean;
        resource: ResourceReport | null;
        reports: ReportContent[];
    }>({
        open: false,
        resource: null,
        reports: [],
    });

    const { isLoading: reportsLoading, reports, pagination, searchReports } = useReports();
    const { hidePostByID, isLoading } = usePosts();
    const { toast } = useToast();

    const columns: ColumnDef<ResourceReport>[] = [
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
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <div className='text-slate-400 capitalize'>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'content',
            header: 'Content',
            cell: ({ row }) => (
                <div className='flex flex-row gap-2'>
                    {row.getValue('type') === 'post' ? (
                        <p
                            className='hover:cursor-pointer hover:underline underline-offset-4'
                            onClick={() => window.open('/posts/' + row.original.id)}
                        >
                            {row.original.content.slice(0, 120) + '...'}
                        </p>
                    ) : (
                        <div
                            className='flex flex-col gap-[1px]'
                            onClick={() => window.open('/posts/' + row.original.blogPostId)}
                        >
                            {row.original.content}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'reportCount',
            header: 'Report Count',
            cell: ({ row }) => <div className='text-rose-500'>{row.getValue('reportCount')}</div>,
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-rose-600'>
                                <span className='sr-only'>Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                className='hover:!bg-sky-600 hover:pointer'
                                onClick={() =>
                                    setDialogState({
                                        open: true,
                                        resource: row.original,
                                        reports: row.original.reports,
                                    })
                                }
                            >
                                <Eye />
                                View reports
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='hover:!bg-rose-700 hover:pointer'
                                onClick={() => hideContentSubmit(row.original.id, row.original.type)}
                            >
                                {!isLoading ? <ShieldBan /> : <Loader2 className='animate-spin' />}
                                {!isLoading ? `Hide ${row.original.type} ` : `Hiding ${row.original.type}`}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    console.log(reports);

    const table = useReactTable({
        data: reports,
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
            await searchReports({ ...searchState, page: pageIndex, limit: pageSize });
        };

        conditionallyFetchResources();
    }, []);

    const refetchResults = async (newPageIndex: number, newPageSize?: number) => {
        await searchReports({ ...searchState, page: newPageIndex, limit: newPageSize || pageSize });
    };

    const hideContentSubmit = async (id: number, type: 'post' | 'comment') => {
        try {
            await hidePostByID(id, type);
            setPageIndex(1);
            toast({
                title: `${type.at(0)!.toUpperCase() + type.slice(1)} Hidden`,
                description: `This ${type} has been successfully hidden!`,
            });
        } catch {
            toast({
                title: `Unable to hide ${type}`,
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            await refetchResults(1);
        }
    };

    return (
        <div className='w-full'>
            <Dialog
                open={dialogState.open}
                onOpenChange={(isOpen) => {
                    setDialogState({ ...dialogState, open: isOpen });
                }}
            >
                {dialogState.open && (
                    <DialogContent className='max-w-[900px] w-[600px]'>
                        <DialogHeader>
                            <DialogTitle>View Reports</DialogTitle>
                            <DialogDescription>
                                View all submitted reports below for this {dialogState.resource!.type}.
                            </DialogDescription>
                            <Separator className='!mt-4' />
                        </DialogHeader>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className='grid gap-4 !mt-2'>
                                <div className='grid gap-2'>
                                    <Table>
                                        <TableCaption>
                                            A list of all reports submitted for this {dialogState.resource!.type}.
                                        </TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reporter ID</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Reported At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dialogState.reports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className='font-medium'>{report.reporterId}</TableCell>
                                                    <TableCell>{report.reason}</TableCell>
                                                    <TableCell>
                                                        {dayjs(report.createdAt).format('MMMM D, YYYY')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={2}>Total</TableCell>
                                                <TableCell className='text-left'>
                                                    {dialogState.reports.length} reports
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </div>
                            </div>
                        </form>
                        <DialogFooter className='!mt-4'>
                            <Button
                                onClick={() =>
                                    window.open(
                                        '/posts/' +
                                            (dialogState.resource!.type === 'post'
                                                ? dialogState.resource!.id
                                                : dialogState.resource!.blogPostId!
                                            ).toString(),
                                    )
                                }
                                className='w-full bg-slate-600 hover:bg-slate-500'
                                type='submit'
                            >
                                Open {dialogState.resource!.type.toLowerCase()}
                            </Button>
                            <Button
                                onClick={() => setDialogState({ open: false, resource: null, reports: [] })}
                                className='w-full bg-sky-600 hover:bg-sky-500'
                                type='submit'
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
            <div className='flex items-center py-4 gap-2'>
                <div className='w-fit flex items-center py-4 flex-row gap-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                className='hover:bg-rose-600 dark:text-slate-400 dark:hover:text-white'
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
                                        className='capitalize hover:!bg-rose-600'
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
                </div>
                <div className='w-fit flex items-center py-4 flex-row gap-2 ml-auto'>
                    <Button
                        className='bg-rose-500 hover:bg-rose-400 h-[38px] dark:text-slate-900 ml-6'
                        onClick={() => {
                            setPageIndex(() => {
                                const newPageIndex = 1;
                                refetchResults(newPageIndex, pageSize);
                                return newPageIndex;
                            });
                            return pageSize;
                        }}
                        disabled={reportsLoading}
                    >
                        {reportsLoading ? <Loader2 className='animate-spin' /> : <Search />}
                        {reportsLoading ? 'Searching' : 'Search'}
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
                        {reportsLoading ? (
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
