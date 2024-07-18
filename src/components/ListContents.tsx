"use client"

import React, { useState, useEffect } from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export type Article = {
  id: string
  title: string
  source: string
  publish_date: string
  tags: string[]
}

const ListContents = ({ listId, userId }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "key_details.description",
      header: "Description",
    },
    {
      accessorKey: "url",
      header: "URL",
    },
    {
      accessorKey: "key_details.citation",
      header: "Citation",
    },
    {
      accessorKey: "key_details.keyMentions",
      header: "Key Mentions",
    },
    {
      accessorKey: "key_details.bombshellClaims",
      header: "Bombshell Claims",
    },
  ]

  useEffect(() => {
    fetchListArticles();
  }, [listId]);

  const fetchListArticles = async () => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    // Fetch article IDs from list_articles table
    const { data: listArticlesData, error: listArticlesError } = await supabase
      .from('list_articles')
      .select('article_id')
      .eq('list_id', listId)
      .eq('user_id', userId.userId);

    if (listArticlesError) {
      console.error('Error fetching list articles:', listArticlesError);
      return;
    }

    const articleIds = listArticlesData.map(item => item.article_id);

    // Fetch articles from articles table using the article IDs
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .in('id', articleIds);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
    } else {
      setArticles(articlesData);
    }
  };

  const deleteList = async () => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    // Delete list_article mappings
    const { error: listArticlesError } = await supabase
      .from('list_articles')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId.userId);

    if (listArticlesError) {
      console.error('Error deleting list articles:', listArticlesError);
      return;
    }

    // Delete the list
    const { error: listError } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId.userId);

    if (listError) {
      console.error('Error deleting list:', listError);
    } else {
      // Optionally, you can refresh the lists or navigate away
      console.log('List deleted successfully');
    }
  };

  const table = useReactTable({
    data: articles,
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
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="ml-2" variant="destructive" onClick={deleteList}>
            Delete List
        </Button>
      </div>
      <div className="rounded-md border w-full">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ListContents;