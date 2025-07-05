import type {
  ColumnDef,
  ColumnFiltersState,  SortingState} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useCallback,useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { t } from "@/lib/i18n";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export const DataTable = memo(function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleSortingChange = useCallback((updater: any) => {
    setSorting(updater);
  }, []);

  const handleColumnFiltersChange = useCallback((updater: any) => {
    setColumnFilters(updater);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, table: unknown, searchKey: string) => {
    table.getColumn(searchKey)?.setFilterValue(event.target.value);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: handleColumnFiltersChange,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="text-white">
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder || t("actions.search")}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => handleSearchChange(event, table, searchKey)}
            className="max-w-sm bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#daa916] focus:ring-[#daa916]"
          />
        </div>
      )}
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-600 hover:bg-gray-700/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[#daa916]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-gray-700 hover:bg-gray-700/50 data-[state=selected]:bg-gray-600"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  {t("messages.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-400">
          {table.getFilteredRowModel().rows.length} {t("messages.totalItems")}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-gray-700 border-gray-600 text-white focus:border-[#daa916] focus:ring-[#daa916]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-gray-800 text-white border-gray-600">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="focus:bg-gray-700">{pageSize}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-[#daa916] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("actions.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-[#daa916] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("actions.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}) as <TData, TValue>(props: DataTableProps<TData, TValue>) => JSX.Element;
