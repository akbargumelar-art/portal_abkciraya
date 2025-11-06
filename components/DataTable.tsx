import React, { useMemo } from 'react';
import { SortIcon } from './icons';

export interface ColumnDef<T> {
  accessorKey: keyof T | `custom_${string}`;
  header: string;
  cell?: (row: T) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  filterType?: 'text' | 'select';
  id?: string;
  group?: string; // New property for grouping
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortConfig: { key: keyof T | `custom_${string}`; direction: 'asc' | 'desc' } | null;
  filters: Record<string, string>;
  uniqueOptions: Record<string, Set<string>>;
  onSort: (key: keyof T | `custom_${string}`) => void;
  onFilterChange: (key: keyof T | `custom_${string}`, value: string) => void;
}

const DataTable = <T extends object>({ 
  columns, 
  data,
  sortConfig,
  filters,
  uniqueOptions,
  onSort,
  onFilterChange,
}: DataTableProps<T>) => {

  const headerGroups = useMemo(() => {
    const hasGrouping = columns.some(c => c.group);
    if (!hasGrouping) return { hasGrouping: false, topRow: [], bottomRow: columns };

    const finalTopRow = columns.reduce((acc, col) => {
      if (col.group) {
        if (!acc.find(h => h.header === col.group)) {
          acc.push({ header: col.group, colSpan: columns.filter(c => c.group === col.group).length, rowSpan: 1 });
        }
      } else {
        acc.push({ header: col.header, colSpan: 1, rowSpan: 2, originalColumn: col });
      }
      return acc;
    }, [] as { header: string; colSpan: number; rowSpan: number; originalColumn?: ColumnDef<T> }[]);
    
    const finalBottomRow = columns.filter(col => col.group);

    return { hasGrouping: true, topRow: finalTopRow, bottomRow: finalBottomRow };
  }, [columns]);
  
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        case 'left':
        default: return 'text-left';
    }
  };

  const getHeaderGroupClass = (groupName: string, level: 1 | 2) => {
    const name = (groupName || '').toLowerCase();
    
    // byU (byu.id blue)
    if (name === 'byu') {
        return level === 1 ? 'bg-blue-700 border-blue-800' : 'bg-blue-600 border-blue-700';
    }

    // Specific product/category colors
    if (name.startsWith('qty')) { // Handle 'QTY CVM' and 'QTY Super Seru'
        const product = name.split(' ')[1];
        if (product === 'cvm') return level === 1 ? 'bg-red-800 border-red-900' : 'bg-red-700 border-red-800';
        if (product === 'superseru') return level === 1 ? 'bg-green-700 border-green-800' : 'bg-green-600 border-green-700';
    }
     if (name.startsWith('revenue')) { // Handle 'Revenue CVM' and 'Revenue Super Seru'
        const product = name.split(' ')[1];
        if (product === 'cvm') return level === 1 ? 'bg-orange-700 border-orange-800' : 'bg-orange-600 border-orange-700';
        if (product === 'superseru') return level === 1 ? 'bg-teal-700 border-teal-800' : 'bg-teal-600 border-teal-700';
    }
    if (name === 'inject vf' || name === 'super seru') {
        return level === 1 ? 'bg-green-700 border-green-600' : 'bg-green-600 border-green-500';
    }
    if (name === 'st') {
        return level === 1 ? 'bg-blue-700 border-blue-600' : 'bg-blue-600 border-blue-500';
    }
    if (name === 'recharge' || name === 'total omzet') {
        return level === 1 ? 'bg-indigo-700 border-indigo-600' : 'bg-indigo-600 border-indigo-500';
    }

    // Total columns
    if (name.includes('total')) {
        return level === 1 ? 'bg-gray-700 border-gray-800' : 'bg-gray-600 border-gray-700';
    }

    // Default for Simpati, CVM, and any other Telkomsel-related group (Telkomsel Red)
    return level === 1 ? 'bg-red-800 border-red-900' : 'bg-red-700 border-red-800';
  };


  return (
    <div className="max-h-[70vh] overflow-auto border-t rounded-lg">
      <table className="w-full text-sm text-gray-500">
        <thead className="text-xs text-white uppercase bg-red-800 whitespace-nowrap sticky top-0 z-10">
          {headerGroups.hasGrouping && (
            <tr>
              {headerGroups.topRow.map((group, index) => (
                <th key={index} scope="col" colSpan={group.colSpan} rowSpan={group.rowSpan} className={`px-4 py-3 align-middle text-center border-x ${getHeaderGroupClass(group.header, 1)}`}>
                  {group.rowSpan === 2 && group.originalColumn ? (
                    <div 
                      className={`flex items-center justify-center gap-2 ${group.originalColumn.enableSorting ? 'cursor-pointer select-none' : ''}`}
                      onClick={() => {
                        if (group.originalColumn?.enableSorting) onSort(group.originalColumn.accessorKey);
                      }}
                    >
                      {group.header}
                      {group.originalColumn.enableSorting && <SortIcon direction={sortConfig?.key === group.originalColumn.accessorKey ? sortConfig.direction : null} />}
                    </div>
                  ) : group.header}
                </th>
              ))}
            </tr>
          )}
          <tr>
            {(headerGroups.hasGrouping ? headerGroups.bottomRow : columns).map((col) => (
              <th key={col.id ?? col.accessorKey as string} scope="col" className={`px-4 py-3 align-middle border-x ${getHeaderGroupClass(col.group ?? col.header, 2)}`}>
                <div 
                  className={`flex items-center justify-center gap-2 ${col.enableSorting ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.enableSorting && onSort(col.accessorKey as keyof T)}
                >
                  {col.header}
                  {col.enableSorting && <SortIcon direction={sortConfig?.key === col.accessorKey ? sortConfig.direction : null} />}
                </div>
              </th>
            ))}
          </tr>
          <tr className="bg-white">
            {columns.map((col) => (
              <th key={`filter-${col.id ?? col.accessorKey as string}`} className="p-2 font-normal">
                {col.enableFiltering && col.filterType === 'select' ? (
                  <select
                      value={filters[col.accessorKey as string] || ''}
                      onChange={(e) => onFilterChange(col.accessorKey as keyof T, e.target.value)}
                      className="w-full text-sm p-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                    >
                      <option value="">-- Pilih --</option>
                      {uniqueOptions[col.accessorKey as string] && Array.from(uniqueOptions[col.accessorKey as string]).sort().map(option => (
                        <option key={option} value={option}>{option || 'N/A'}</option>
                      ))}
                    </select>
                ) : col.enableFiltering ? (
                  <input
                    type="text"
                    placeholder={`Cari ${col.header}...`}
                    value={filters[col.accessorKey as string] || ''}
                    onChange={(e) => onFilterChange(col.accessorKey as keyof T, e.target.value)}
                    className="w-full text-sm p-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                  />
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.id ?? col.accessorKey as string} className={`px-4 py-2 text-gray-800 whitespace-nowrap ${getAlignmentClass(col.align)}`}>
                      {col.cell ? col.cell(row) : String(row[col.accessorKey as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
          ) : (
              <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                      Tidak ada data yang tersedia.
                  </td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;