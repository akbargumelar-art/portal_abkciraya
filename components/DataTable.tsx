
import React, { useState, useMemo } from 'react';
import { SortIcon } from './icons';

export interface ColumnDef<T> {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  filterType?: 'text' | 'select';
  id?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

const DataTable = <T extends object>({ columns, data }: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: keyof T, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
  
  const uniqueOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    columns.forEach(col => {
      if (col.filterType === 'select') {
        options[col.accessorKey as string] = new Set(data.map(item => String(item[col.accessorKey as keyof T])));
      }
    });
    return options;
  }, [data, columns]);


  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key as keyof T] ?? '').toLowerCase();
        return itemValue.includes(String(value).toLowerCase());
      });
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-red-800 whitespace-nowrap">
            <tr>
              {columns.map((col) => (
                <th key={col.id ?? col.accessorKey as string} scope="col" className="px-4 py-3">
                  <div 
                    className={`flex items-center gap-2 ${col.enableSorting ? 'cursor-pointer select-none' : ''}`}
                    onClick={() => col.enableSorting && handleSort(col.accessorKey as keyof T)}
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
                        onChange={(e) => handleFilterChange(col.accessorKey as keyof T, e.target.value)}
                        className="w-full text-sm p-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                      >
                        <option value="">-- Pilih --</option>
                        {uniqueOptions[col.accessorKey as string] && Array.from(uniqueOptions[col.accessorKey as string]).map(option => (
                          <option key={option} value={option}>{option || 'N/A'}</option>
                        ))}
                      </select>
                  ) : col.enableFiltering ? (
                    <input
                      type="text"
                      placeholder={`Cari ${col.header}...`}
                      onChange={(e) => handleFilterChange(col.accessorKey as keyof T, e.target.value)}
                      className="w-full text-sm p-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.id ?? col.accessorKey as string} className="px-4 py-2 text-gray-800 whitespace-nowrap">
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
      {/* Pagination */}
       <div className="flex flex-col items-center gap-4 p-4 border-t sm:flex-row sm:justify-between">
            <span className="text-sm text-gray-700">
                Showing <span className="font-semibold">{Math.min(paginatedData.length, sortedData.length > 0 ? 1 : 0) > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-semibold">{sortedData.length}</span> results
            </span>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
  );
};

export default DataTable;
