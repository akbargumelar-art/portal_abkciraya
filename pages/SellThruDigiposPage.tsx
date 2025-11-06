
import React, { useMemo, useState, useEffect } from 'react';
import { getSellThruDigiposPerdana, getSellThruDigiposVoucher } from '../services/api';
import { SellThruDigiposData } from '../types';
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

const SellThruDigiposPage: React.FC = () => {
    const [perdanaData, setPerdanaData] = useState<SellThruDigiposData[]>([]);
    const [voucherData, setVoucherData] = useState<SellThruDigiposData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [perdana, voucher] = await Promise.all([
                    getSellThruDigiposPerdana(),
                    getSellThruDigiposVoucher(),
                ]);
                setPerdanaData(perdana);
                setVoucherData(voucher);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <LoadingIndicator type="table" tableColumns={8} text="Memuat data ST Digipos..." />;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Sell Thru (ST) Digipos</h1>
            </div>
            <TableSection title="Detail Perdana" data={perdanaData} type="Perdana" />
            <TableSection title="Detail Voucher Fisik" data={voucherData} type="Voucher" />
        </div>
    );
};

interface TableSectionProps {
    title: string;
    data: SellThruDigiposData[];
    type: 'Perdana' | 'Voucher';
}

const TableSection: React.FC<TableSectionProps> = ({ title, data, type }) => {
    type ProcessedData = SellThruDigiposData & {
      simpatiGrowth: number;
      byuGrowth: number;
      totalGrowth: number;
      simpatiAchv: number;
      byuAchv: number;
      totalAchv: number;
    };
    
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessedData | `custom_${string}`; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});

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
            simpatiGrowth: calculateGrowth(item.simpati.M, item.simpati.M_1),
            byuGrowth: calculateGrowth(item.byu.M, item.byu.M_1),
            totalGrowth: calculateGrowth(item.total.M, item.total.M_1),
            simpatiAchv: calculateAchievement(item.simpati.M, item.simpati.target),
            byuAchv: calculateAchievement(item.byu.M, item.byu.target),
            totalAchv: calculateAchievement(item.total.M, item.total.target),
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

    const columns = useMemo<ColumnDef<ProcessedData>[]>(() => [
        { accessorKey: 'ID_DIGIPOS', header: 'ID Digipos', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NO_RS', header: 'No RS', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NAMA_OUTLET', header: 'Nama Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'SALESFORCE', header: 'Salesforce', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'TAP', header: 'TAP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KABUPATEN', header: 'Kabupaten', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KECAMATAN', header: 'Kecamatan', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'FLAG', header: 'Flag', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },

        { accessorKey: 'custom_simpati_target', header: 'Target', group: 'Simpati', align: 'right', cell: (row) => row.simpati.target.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_simpati_fm1', header: 'FM-1', group: 'Simpati', align: 'right', cell: (row) => row.simpati.FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_simpati_m1', header: 'M-1', group: 'Simpati', align: 'right', cell: (row) => row.simpati.M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_simpati_m', header: 'M', group: 'Simpati', align: 'right', cell: (row) => row.simpati.M.toLocaleString(), enableSorting: true },
        { accessorKey: 'simpatiAchv', header: 'Achv', group: 'Simpati', align: 'right', cell: (row) => <AchvCell value={row.simpatiAchv} />, enableSorting: true },
        { accessorKey: 'simpatiGrowth', header: 'Growth', group: 'Simpati', align: 'right', cell: (row) => <GrowthCell value={row.simpatiGrowth} />, enableSorting: true },

        { accessorKey: 'custom_byu_target', header: 'Target', group: 'byU', align: 'right', cell: (row) => row.byu.target.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_byu_fm1', header: 'FM-1', group: 'byU', align: 'right', cell: (row) => row.byu.FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_byu_m1', header: 'M-1', group: 'byU', align: 'right', cell: (row) => row.byu.M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_byu_m', header: 'M', group: 'byU', align: 'right', cell: (row) => row.byu.M.toLocaleString(), enableSorting: true },
        { accessorKey: 'byuAchv', header: 'Achv', group: 'byU', align: 'right', cell: (row) => <AchvCell value={row.byuAchv} />, enableSorting: true },
        { accessorKey: 'byuGrowth', header: 'Growth', group: 'byU', align: 'right', cell: (row) => <GrowthCell value={row.byuGrowth} />, enableSorting: true },
        
        { accessorKey: 'custom_total_target', header: 'Target', group: `Total ${type}`, align: 'right', cell: (row) => row.total.target.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_total_fm1', header: 'FM-1', group: `Total ${type}`, align: 'right', cell: (row) => row.total.FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_total_m1', header: 'M-1', group: `Total ${type}`, align: 'right', cell: (row) => row.total.M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_total_m', header: 'M', group: `Total ${type}`, align: 'right', cell: (row) => row.total.M.toLocaleString(), enableSorting: true },
        { accessorKey: 'totalAchv', header: 'Achv', group: `Total ${type}`, align: 'right', cell: (row) => <AchvCell value={row.totalAchv} />, enableSorting: true },
        { accessorKey: 'totalGrowth', header: 'Growth', group: `Total ${type}`, align: 'right', cell: (row) => <GrowthCell value={row.totalGrowth} />, enableSorting: true },
    ], [type]);
    
    const getNestedValue = (obj: any, path: string | symbol): any => {
      const pathStr = String(path);
      if (pathStr.startsWith('custom_')) {
        const parts = pathStr.split('_'); // e.g., ['custom', 'simpati', 'fm1']
        const objectKey = parts[1] as keyof ProcessedData;
        let propertyKey = parts[2]; // e.g., 'fm1', 'm1', 'target'
        const propertyKeyMap: Record<string, string> = { 'fm1': 'FM_1', 'm1': 'M_1', 'm': 'M', 'target': 'target' };
        const mappedKey = propertyKeyMap[propertyKey];
        if (mappedKey && typeof objectKey === 'string' && obj[objectKey]) {
            return (obj[objectKey] as any)[mappedKey];
        }
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
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const handleSort = (key: keyof ProcessedData | `custom_${string}`) => setSortConfig(c => ({ key, direction: c && c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));
    const handleFilterChange = (key: keyof ProcessedData, value: string) => setFilters(p => ({ ...p, [key as string]: value }));

    const handleExport = () => {
        const dataToExport = sortedData.map(row => ({
            'ID Digipos': row.ID_DIGIPOS, 'No RS': row.NO_RS, 'Nama Outlet': row.NAMA_OUTLET, 'Salesforce': row.SALESFORCE, 'TAP': row.TAP, 'Kabupaten': row.KABUPATEN, 'Kecamatan': row.KECAMATAN, 'Flag': row.FLAG,
            'Simpati Target': row.simpati.target, 'Simpati FM-1': row.simpati.FM_1, 'Simpati M-1': row.simpati.M_1, 'Simpati M': row.simpati.M, 'Simpati Achv (%)': row.simpatiAchv.toFixed(1), 'Simpati Growth (%)': row.simpatiGrowth.toFixed(1),
            'byU Target': row.byu.target, 'byU FM-1': row.byu.FM_1, 'byU M-1': row.byu.M_1, 'byU M': row.byu.M, 'byU Achv (%)': row.byuAchv.toFixed(1), 'byU Growth (%)': row.byuGrowth.toFixed(1),
            'Total Target': row.total.target, 'Total FM-1': row.total.FM_1, 'Total M-1': row.total.M_1, 'Total M': row.total.M, 'Total Achv (%)': row.totalAchv.toFixed(1), 'Total Growth (%)': row.totalGrowth.toFixed(1),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `ST Digipos ${type}`);
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `st_digipos_${type.toLowerCase()}_${date}.xlsx`);
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
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
    );
};

export default SellThruDigiposPage;
