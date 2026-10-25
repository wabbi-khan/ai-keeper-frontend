'use client';

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { Pitch } from '@/types/deal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getEditorialStatusTheme } from '@/config/theme';
import { toast } from 'sonner';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  AlertTriangle,
  Download,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

interface DealFlowDataTableProps {
  data: Pitch[];
  isLoading?: boolean;
  onInspectPitch: (pitch: Pitch) => void;
  onBulkReject?: (selectedPitchIds: string[]) => void;
}

// Compact currency formatters
const formatCompactMillions = (amount: number) => {
  const val = amount / 1_000_000;
  return `$${val.toFixed(val % 1 === 0 ? 0 : 1)}M`;
};

const formatThousands = (amount: number) => {
  return `$${Math.round(amount / 1000).toLocaleString()}k`;
};

// CSV Export helper
function exportPitchesToCsv(pitches: Pitch[]) {
  const headers = [
    'Startup Name',
    'Founders',
    'Email',
    'Sector',
    'Stage',
    'MRR ($)',
    'Ask Amount ($)',
    'Valuation ($)',
    'Match Score',
    'Status',
    'Summary',
  ];

  const rows = pitches.map((p) => [
    `"${p.startupName.replace(/"/g, '""')}"`,
    `"${p.founderNames.replace(/"/g, '""')}"`,
    `"${p.founderEmail}"`,
    `"${p.sector}"`,
    `"${p.stage}"`,
    p.reportedMrr,
    p.askAmount,
    p.valuation,
    p.matchScore,
    p.status,
    `"${p.summary.replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `dealflow_export_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function DealFlowDataTable({
  data,
  isLoading = false,
  onInspectPitch,
  onBulkReject,
}: DealFlowDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'matchScore', desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageSize, setPageSize] = useState<number>(10);

  // Column definitions
  const columns = useMemo<ColumnDef<Pitch>[]>(
    () => [
      // 0. Row Selection Checkbox
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center pl-1">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all deals on this page"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center pl-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`Select deal ${row.original.startupName}`}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },

      // 1. Startup & Tagline
      {
        accessorKey: 'startupName',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#161514] hover:text-[#163728] transition-colors cursor-pointer select-none group"
            >
              <span>Startup & Tagline</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#163728]" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#163728]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A5A29C] opacity-60 group-hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const pitch = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#161514] group-hover:text-[#163728] transition-colors">
                  {pitch.startupName}
                </span>
                {pitch.matchScore >= 85 && (
                  <span className="inline-flex items-center text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#E6EFEA] text-[#1A422F] border border-[#C3DCD0]">
                    TOP 1%
                  </span>
                )}
                {pitch.status === 'REJECTED' && (
                  <span className="inline-flex items-center text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#FAECEB] text-[#862820] border border-[#F1C9C5]">
                    PASSED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#73706A] line-clamp-1 max-w-sm font-normal">
                {pitch.tagline}
              </p>
              <div className="text-[11px] text-[#A5A29C] font-normal">
                By {pitch.founderNames}
              </div>
            </div>
          );
        },
      },

      // 2. Sector & Stage
      {
        accessorKey: 'sector',
        header: () => (
          <span className="text-xs font-semibold text-[#161514]">
            Sector & Stage
          </span>
        ),
        cell: ({ row }) => {
          const pitch = row.original;
          return (
            <div className="flex flex-col gap-1 items-start">
              <Badge
                variant="secondary"
                className="bg-[#F3F1EC] text-[#161514] border border-[#E5E2DC] text-xs font-medium px-2 py-0.5 rounded-md"
              >
                {pitch.sector}
              </Badge>
              <span className="text-[11px] font-financial text-[#73706A] pl-0.5">
                {pitch.stage}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },

      // 3. Financials (Reported MRR)
      {
        accessorKey: 'reportedMrr',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#161514] hover:text-[#163728] transition-colors cursor-pointer select-none group"
            >
              <span>MRR</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#163728]" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#163728]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A5A29C] opacity-60 group-hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const pitch = row.original;
          return (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1 font-financial">
                <span className="text-sm font-semibold text-[#161514]">
                  {formatThousands(pitch.reportedMrr)}
                </span>
                <span className="text-[11px] text-[#73706A] font-sans">
                  /mo
                </span>
              </div>
              <div className="text-[11px] text-[#73706A] font-financial">
                ~{formatThousands(pitch.reportedMrr * 12)} Run Rate
              </div>
            </div>
          );
        },
        sortingFn: 'basic',
      },

      // 4. Target Ask / Valuation
      {
        accessorKey: 'askAmount',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#161514] hover:text-[#163728] transition-colors cursor-pointer select-none group"
            >
              <span>Ask & Valuation</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#163728]" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#163728]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A5A29C] opacity-60 group-hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const pitch = row.original;
          return (
            <div className="space-y-0.5 font-financial">
              <div className="text-sm font-semibold text-[#163728]">
                {formatCompactMillions(pitch.askAmount)}
              </div>
              <div className="text-xs text-[#73706A]">
                @ {formatCompactMillions(pitch.valuation)} Val
              </div>
            </div>
          );
        },
        sortingFn: 'basic',
      },

      // 5. AI Match Score & Flags
      {
        accessorKey: 'matchScore',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#161514] hover:text-[#163728] transition-colors cursor-pointer select-none group"
            >
              <span>AI Match Score</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#163728]" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#163728]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A5A29C] opacity-60 group-hover:opacity-100" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const pitch = row.original;
          const theme = getEditorialStatusTheme(pitch.matchScore);

          return (
            <div className="space-y-1.5 max-w-[170px]">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-xs font-financial font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${theme.badge}`}
                >
                  <span>{pitch.matchScore}/100</span>
                </Badge>

                {pitch.redFlags.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-[#FAECEB] text-[#862820] border-[#F1C9C5] text-[10px] font-financial px-1.5 py-0 flex items-center gap-0.5"
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-[#862820]" />
                    <span>{pitch.redFlags.length} Flags</span>
                  </Badge>
                ) : (
                  <span className="text-[10px] font-financial text-[#73706A]">
                    0 Flags
                  </span>
                )}
              </div>

              <div className="w-full">
                <Progress
                  value={pitch.matchScore}
                  className={`w-full h-1.5 rounded-full [&_[data-slot=progress-track]]:bg-[#E5E2DC] ${theme.progressIndicator}`}
                />
              </div>
            </div>
          );
        },
        sortingFn: 'basic',
      },

      // 6. Action Button
      {
        id: 'actions',
        header: () => (
          <span className="text-xs font-semibold text-[#161514] text-right block pr-2">
            Action
          </span>
        ),
        cell: ({ row }) => {
          return (
            <div className="text-right pr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectPitch(row.original);
                }}
                className="border-[#E5E2DC] bg-white hover:bg-[#F3F1EC] text-[#161514] text-xs gap-1.5 rounded-md shadow-none cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#73706A]" />
                <span>Inspect</span>
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [onInspectPitch]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  // Handle bulk pass action
  const handleBulkPass = () => {
    if (selectedCount === 0) return;
    const ids = selectedRows.map((r) => r.original.id);
    onBulkReject?.(ids);
    setRowSelection({});
  };

  // Handle bulk CSV export
  const handleExportSelected = () => {
    if (selectedCount === 0) return;
    const selectedPitches = selectedRows.map((r) => r.original);
    exportPitchesToCsv(selectedPitches);
    toast.success(`Exported ${selectedCount} deals to CSV`, {
      description: 'Your spreadsheet download will begin immediately.',
      duration: 3500,
    });
  };

  return (
    <div className="space-y-3 relative">
      {/* Floating Bulk Action Bar when rows are selected */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#161514] text-white px-4 py-2.5 rounded-md shadow-2xl border border-[#2C2926] flex items-center gap-3.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 border-r border-[#33302B] pr-3">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span className="font-financial font-medium">
              {selectedCount} {selectedCount === 1 ? 'deal' : 'deals'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkPass}
              className="inline-flex items-center gap-1.5 bg-[#862820] hover:bg-[#681F19] text-white px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Bulk Pass / Reject</span>
            </button>

            <button
              onClick={handleExportSelected}
              className="inline-flex items-center gap-1.5 bg-[#262421] hover:bg-[#383531] text-[#F9F8F5] px-2.5 py-1.5 rounded text-xs font-medium border border-[#3E3A35] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setRowSelection({})}
              className="text-[#A5A29C] hover:text-white text-xs underline pl-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* TanStack Table Container */}
      <div className="rounded-md border border-[#E5E2DC] bg-white overflow-hidden shadow-none">
        <Table>
          <TableHeader className="bg-[#F3F1EC] border-b border-[#E5E2DC]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-[#E5E2DC]"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="py-3 px-3 text-xs font-semibold text-[#161514]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-[#E5E2DC]">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-36 text-center text-[#73706A]"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="w-5 h-5 border-2 border-[#163728] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-[#73706A]">
                      Synchronizing deal flow from investor ledger...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-36 text-center text-[#73706A]"
                >
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <Search className="w-6 h-6 text-[#A5A29C]" />
                    <p className="text-xs font-medium text-[#161514]">
                      No deals match your filter criteria
                    </p>
                    <p className="text-[11px] text-[#73706A]">
                      Try resetting your search query or switching active tabs.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onInspectPitch(row.original)}
                  className="hover:bg-[#FAF9F6] cursor-pointer transition-colors group border-[#E5E2DC]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 px-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#73706A] px-1 pt-1">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="font-financial text-[#161514]">
              {table.getFilteredRowModel().rows.length === 0
                ? 0
                : table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                  1}
            </strong>{' '}
            to{' '}
            <strong className="font-financial text-[#161514]">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </strong>{' '}
            of{' '}
            <strong className="font-financial text-[#161514]">
              {table.getFilteredRowModel().rows.length}
            </strong>{' '}
            deals
          </span>

          <span className="text-[#D0CDC6]">•</span>

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                table.setPageSize(val);
                setPageSize(val);
              }}
              className="bg-white border border-[#E5E2DC] text-xs text-[#161514] rounded px-1.5 py-0.5 focus:border-[#163728] outline-none cursor-pointer"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 px-2.5 text-xs border-[#E5E2DC] bg-white text-[#161514] hover:bg-[#F3F1EC] disabled:opacity-40 rounded-md shadow-none cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            <span>Prev</span>
          </Button>

          <span className="font-financial text-xs px-2 text-[#161514]">
            {table.getState().pagination.pageIndex + 1} /{' '}
            {Math.max(1, table.getPageCount())}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 px-2.5 text-xs border-[#E5E2DC] bg-white text-[#161514] hover:bg-[#F3F1EC] disabled:opacity-40 rounded-md shadow-none cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
