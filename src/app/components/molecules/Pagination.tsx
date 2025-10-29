import { Table } from '@tanstack/react-table';
import { Button } from '../atoms/Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps<TData> {
    table: Table<TData>;
}

export function Pagination<TData>({ table }: PaginationProps<TData>) {
    const { pageIndex } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const maxPages = 10;
    const startPage = Math.max(0, pageIndex - Math.floor(maxPages / 2));
    const endPage = Math.min(pageCount, startPage + maxPages);
    const pages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);

    return (
        <div className="flex justify-center items-center gap-2 mt-4">
            <Button variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft size={16} /></Button>
            <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft size={16} /></Button>
            {pages.map((page) => (
                <Button
                    key={page}
                    variant={page === pageIndex ? 'primary' : 'outline'}
                    onClick={() => table.setPageIndex(page)}
                >
                    {page + 1}
                </Button>
            ))}
            <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight size={16} /></Button>
            <Button variant="outline" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}><ChevronsRight size={16} /></Button>
        </div>
    );
}
