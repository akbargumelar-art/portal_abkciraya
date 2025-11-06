
import React, { useMemo, useState, useEffect } from 'react';
import { getPenjualanD2C } from '../services/api';
import { PenjualanD2CData, PerformanceMetric } from '../types';
import DataTable, { ColumnDef } from '../components/DataTable';
import LoadingIndicator from '../components/LoadingIndicator';

// For CDN-based xlsx library
declare var XLSX: any;

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// FIX: Define a specific type for keys that map to PerformanceMetric to ensure type safety.
type PerformanceMetricKey = 'simpati' | 'byu' | 'voucherSimpati' | 'voucherByu' | 'rechargeAmount' | 'modem';


const PenjualanD2CPage: React.FC = () => {
    const [data, setData] = useState<PenjualanD2CData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    type ProcessedData = PenjualanD2CData & {
        simpatiAchv: number; simpatiMom: number;
        byuAchv: number; byuMom: number;
        voucherSimpatiAchv: number; voucherSimpatiMom: number;
        voucherByuAchv: number; voucherByuMom: number;
        rechargeAmountAchv: number; rechargeAmountMom: number;
        modemAchv: number; modemMom: number;
    };

    const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessedData; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getPenjualanD2C();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous) * 100;
    };
    const calculateAchievement = (current: number, target: number) => {
        if (target === 0) return current > 0 ? Infinity : 0;
        return (current / target) * 100;
    };

    const processedData = useMemo((): ProcessedData[] => {
        return data.map(item => ({
            ...item,
            simpatiAchv: calculateAchievement(item.simpati.m, item.simpati.target),
            simpatiMom: calculateGrowth(item.simpati.m, item.simpati.m1),
            byuAchv: calculateAchievement(item.byu.m, item.byu.target),
            byuMom: calculateGrowth(item.byu.m, item.byu.m1),
            voucherSimpatiAchv: calculateAchievement(item.voucherSimpati.m, item.voucherSimpati.target),
            voucherSimpatiMom: calculateGrowth(item.voucherSimpati.m, item.voucherSimpati.m1),
            voucherByuAchv: calculateAchievement(item.voucherByu.m, item.voucherByu.target),
            voucherByuMom: calculateGrowth(item.voucherByu.m, item.voucherByu.m1),
            rechargeAmountAchv: calculateAchievement(item.rechargeAmount.m, item.rechargeAmount.target),
            rechargeAmountMom: calculateGrowth(item.rechargeAmount.m, item.rechargeAmount.m1),
            modemAchv: calculateAchievement(item.modem.m, item.modem.target),
            modemMom: calculateGrowth(item.modem.m, item.modem.m1),
        }));
    }, [data]);

    const GrowthCell: React.FC<{ value: number }> = ({ value }) => {
        if (!isFinite(value)) return <span className="font-semibold text-green-600">New ▲</span>;
        const displayValue = value.toFixed(1);
        return (
          <span className={`font-semibold flex items-center justify-end gap-1 ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {displayValue}% {value >= 0 ? '▲' : '▼'}
          </span>
        );
    };
    const AchvCell: React.FC<{ value: number }> = ({ value }) => {
        if (!isFinite(value)) return <span className="font-semibold text-green-600">N/A</span>;
        const displayValue = value.toFixed(1);
        let colorClass = '';
        if (value >= 100) colorClass = 'text-green-600';
        else if (value >= 75) colorClass = 'text-yellow-600';
        else colorClass = 'text-red-600';
        return <span className={`font-semibold ${colorClass}`}>{displayValue}%</span>;
    };
    const formatValue = (value: number) => value.toLocaleString('id-ID');

    const columns = useMemo<ColumnDef<ProcessedData>[]>(() => {
      // FIX: Use the specific PerformanceMetricKey to ensure the accessor is a key pointing to a PerformanceMetric object.
      const metricColumns = (group: string, accessor: PerformanceMetricKey): ColumnDef<ProcessedData>[] => [
        { accessorKey: `custom_${accessor}_target`, header: 'Target', group, align: 'right', cell: (row) => formatValue(row[accessor].target), enableSorting: true },
        { accessorKey: `custom_${accessor}_fm1`, header: 'FM-1', group, align: 'right', cell: (row) => formatValue(row[accessor].fm1), enableSorting: true },
        { accessorKey: `custom_${accessor}_m1`, header: 'M-1', group, align: 'right', cell: (row) => formatValue(row[accessor].m1), enableSorting: true },
        { accessorKey: `custom_${accessor}_m`, header: 'M', group, align: 'right', cell: (row) => formatValue(row[accessor].m), enableSorting: true },
        { accessorKey: `${accessor}Achv`, header: 'Achv', group, align: 'right', cell: (row) => <AchvCell value={row[`${accessor}Achv`]} />, enableSorting: true },
        { accessorKey: `${accessor}Mom`, header: 'MoM', group, align: 'right', cell: (row) => <GrowthCell value={row[`${accessor}Mom`]} />, enableSorting: true },
      ];
      return [
        { accessorKey: 'namaD2C', header: 'Nama D2C', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'city', header: 'City', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        ...metricColumns('Simpati', 'simpati'),
        ...metricColumns('byU', 'byu'),
        ...metricColumns('Voucher Simpati', 'voucherSimpati'),
        ...metricColumns('Voucher byU', 'voucherByu'),
        ...metricColumns('Recharge Amount', 'rechargeAmount'),
        ...metricColumns('Modem', 'modem'),
      ]
    }, []);

    const getNestedValue = (obj: any, path: string | symbol): any => {
      const pathStr = String(path);
      if (pathStr.startsWith('custom_')) {
        const parts = pathStr.split('_'); // e.g., ['custom', 'simpati', 'target']
        return obj[parts[1]]?.[parts[2]];
      }
      return path.toString().split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const uniqueOptions = useMemo(() => {
        const options: Record<string, Set<string>> = {};
        columns.forEach(col => {
            const key = col.accessorKey;
            if (col.filterType === 'select') {
                options[key as string] = new Set(processedData.map(item => String(getNestedValue(item, key))));
            }
        });
        return options;
    }, [processedData, columns]);

    const filteredData = useMemo(() => {
        return processedData.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const itemValue = String(getNestedValue(item, key) ?? '').toLowerCase();
                const filterValue = String(value).toLowerCase();
                return itemValue.includes(filterValue);
            });
        });
    }, [processedData, filters]);

    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const handleSort = (key: keyof ProcessedData) => setSortConfig(c => ({ key, direction: c && c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));
    const handleFilterChange = (key: keyof ProcessedData, value: string) => setFilters(p => ({ ...p, [key as string]: value }));
    
    const handleExport = () => {
      const dataToExport = sortedData.map(row => {
        const rowData: Record<string, any> = { 'Nama D2C': row.namaD2C, 'City': row.city };
        // FIX: Use the strongly-typed PerformanceMetricKey array for type-safe property access.
        const groups: PerformanceMetricKey[] = ['simpati', 'byu', 'voucherSimpati', 'voucherByu', 'rechargeAmount', 'modem'];
        const groupNames = ['Simpati', 'byU', 'Voucher Simpati', 'Voucher byU', 'Recharge Amount', 'Modem'];
        groups.forEach((group, i) => {
          rowData[`${groupNames[i]} Target`] = row[group].target;
          rowData[`${groupNames[i]} FM-1`] = row[group].fm1;
          rowData[`${groupNames[i]} M-1`] = row[group].m1;
          rowData[`${groupNames[i]} M`] = row[group].m;
          rowData[`${groupNames[i]} Achv (%)`] = (row[`${group}Achv`]).toFixed(1);
          rowData[`${groupNames[i]} MoM (%)`] = (row[`${group}Mom`]).toFixed(1);
        });
        return rowData;
      });
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Penjualan D2C`);
      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `penjualan_d2c_${date}.xlsx`);
    };

    if (isLoading) return <LoadingIndicator type="table" tableColumns={6} text="Memuat data penjualan D2C..." />;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Penjualan D2C</h1>
            </div>
             <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Detail Penjualan</h2>
                    <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Export ke Excel</span>
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow">
                    <DataTable 
                        columns={columns} 
                        data={sortedData}
                        sortConfig={sortConfig}
                        filters={filters}
                        uniqueOptions={uniqueOptions}
                        onSort={handleSort as any}
                        onFilterChange={handleFilterChange as any}
                    />
                </div>
            </div>
        </div>
    );
};

export default PenjualanD2CPage;
