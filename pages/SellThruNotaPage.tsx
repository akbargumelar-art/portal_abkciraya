
import React, { useMemo, useState, useEffect } from 'react';
import { getSellThruNotaPerdana, getSellThruNotaVoucher } from '../services/api';
import { SellThruNotaData } from '../types';
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

const SellThruNotaPage: React.FC = () => {
    const [perdanaData, setPerdanaData] = useState<SellThruNotaData[]>([]);
    const [voucherData, setVoucherData] = useState<SellThruNotaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [perdana, voucher] = await Promise.all([
                    getSellThruNotaPerdana(),
                    getSellThruNotaVoucher(),
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

    if (isLoading) return <LoadingIndicator type="table" tableColumns={8} text="Memuat data ST Nota..." />;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Sell Thru (ST) Nota</h1>
            </div>
            <TableSection title="Detail Perdana" data={perdanaData} type="Perdana" />
            <TableSection title="Detail Voucher Fisik" data={voucherData} type="Voucher" />
        </div>
    );
};

interface TableSectionProps {
    title: string;
    data: SellThruNotaData[];
    type: 'Perdana' | 'Voucher';
}

const TableSection: React.FC<TableSectionProps> = ({ title, data, type }) => {
    type ProcessedData = SellThruNotaData & {
      qtySimpatiGrowth: number; amountSimpatiGrowth: number;
      qtyByuGrowth: number; amountByuGrowth: number;
      totalQtyGrowth: number; totalAmountGrowth: number;
    };
    
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessedData; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous) * 100;
    };

    const processedData = useMemo((): ProcessedData[] => {
        return data.map(item => ({
            ...item,
            qtySimpatiGrowth: calculateGrowth(item.qtySimpati.M, item.qtySimpati.M_1),
            amountSimpatiGrowth: calculateGrowth(item.amountSimpati.M, item.amountSimpati.M_1),
            qtyByuGrowth: calculateGrowth(item.qtyByu.M, item.qtyByu.M_1),
            amountByuGrowth: calculateGrowth(item.amountByu.M, item.amountByu.M_1),
            totalQtyGrowth: calculateGrowth(item.totalQty.M, item.totalQty.M_1),
            totalAmountGrowth: calculateGrowth(item.totalAmount.M, item.totalAmount.M_1),
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
    const formatCurrency = (value: number) => value.toLocaleString('id-ID');

    const columns = useMemo<ColumnDef<ProcessedData>[]>(() => [
        { accessorKey: 'ID_DIGIPOS', header: 'ID Digipos', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NO_RS', header: 'No RS', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NAMA_OUTLET', header: 'Nama Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'SALESFORCE', header: 'Salesforce', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'TAP', header: 'TAP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KABUPATEN', header: 'Kabupaten', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KECAMATAN', header: 'Kecamatan', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'FLAG', header: 'Flag', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },

        { accessorKey: 'custom_qtySimpati_fm1', header: 'FM-1', group: 'Qty Simpati', align: 'right', cell: (row) => row.qtySimpati.FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_qtySimpati_m1', header: 'M-1', group: 'Qty Simpati', align: 'right', cell: (row) => row.qtySimpati.M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_qtySimpati_m', header: 'M', group: 'Qty Simpati', align: 'right', cell: (row) => row.qtySimpati.M.toLocaleString(), enableSorting: true },
        { accessorKey: 'qtySimpatiGrowth', header: 'Growth', group: 'Qty Simpati', align: 'right', cell: (row) => <GrowthCell value={row.qtySimpatiGrowth} />, enableSorting: true },

        { accessorKey: 'custom_amountSimpati_fm1', header: 'FM-1', group: 'Amount Simpati', align: 'right', cell: (row) => formatCurrency(row.amountSimpati.FM_1), enableSorting: true },
        { accessorKey: 'custom_amountSimpati_m1', header: 'M-1', group: 'Amount Simpati', align: 'right', cell: (row) => formatCurrency(row.amountSimpati.M_1), enableSorting: true },
        { accessorKey: 'custom_amountSimpati_m', header: 'M', group: 'Amount Simpati', align: 'right', cell: (row) => formatCurrency(row.amountSimpati.M), enableSorting: true },
        { accessorKey: 'amountSimpatiGrowth', header: 'Growth', group: 'Amount Simpati', align: 'right', cell: (row) => <GrowthCell value={row.amountSimpatiGrowth} />, enableSorting: true },

        { accessorKey: 'custom_qtyByu_fm1', header: 'FM-1', group: 'Qty byU', align: 'right', cell: (row) => row.qtyByu.FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_qtyByu_m1', header: 'M-1', group: 'Qty byU', align: 'right', cell: (row) => row.qtyByu.M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_qtyByu_m', header: 'M', group: 'Qty byU', align: 'right', cell: (row) => row.qtyByu.M.toLocaleString(), enableSorting: true },
        { accessorKey: 'qtyByuGrowth', header: 'Growth', group: 'Qty byU', align: 'right', cell: (row) => <GrowthCell value={row.qtyByuGrowth} />, enableSorting: true },

        { accessorKey: 'custom_amountByu_fm1', header: 'FM-1', group: 'Amount byU', align: 'right', cell: (row) => formatCurrency(row.amountByu.FM_1), enableSorting: true },
        { accessorKey: 'custom_amountByu_m1', header: 'M-1', group: 'Amount byU', align: 'right', cell: (row) => formatCurrency(row.amountByu.M_1), enableSorting: true },
        { accessorKey: 'custom_amountByu_m', header: 'M', group: 'Amount byU', align: 'right', cell: (row) => formatCurrency(row.amountByu.M), enableSorting: true },
        { accessorKey: 'amountByuGrowth', header: 'Growth', group: 'Amount byU', align: 'right', cell: (row) => <GrowthCell value={row.amountByuGrowth} />, enableSorting: true },
        
        { accessorKey: 'custom_totalQty_fm1', header: 'FM-1', group: `Total ${type} Qty`, align: 'right', cell: (row) => row.totalQty.FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_totalQty_m1', header: 'M-1', group: `Total ${type} Qty`, align: 'right', cell: (row) => row.totalQty.M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'custom_totalQty_m', header: 'M', group: `Total ${type} Qty`, align: 'right', cell: (row) => row.totalQty.M.toLocaleString(), enableSorting: true },
        { accessorKey: 'totalQtyGrowth', header: 'Growth', group: `Total ${type} Qty`, align: 'right', cell: (row) => <GrowthCell value={row.totalQtyGrowth} />, enableSorting: true },

        { accessorKey: 'custom_totalAmount_fm1', header: 'FM-1', group: `Total ${type} Amount`, align: 'right', cell: (row) => formatCurrency(row.totalAmount.FM_1), enableSorting: true },
        { accessorKey: 'custom_totalAmount_m1', header: 'M-1', group: `Total ${type} Amount`, align: 'right', cell: (row) => formatCurrency(row.totalAmount.M_1), enableSorting: true },
        { accessorKey: 'custom_totalAmount_m', header: 'M', group: `Total ${type} Amount`, align: 'right', cell: (row) => formatCurrency(row.totalAmount.M), enableSorting: true },
        { accessorKey: 'totalAmountGrowth', header: 'Growth', group: `Total ${type} Amount`, align: 'right', cell: (row) => <GrowthCell value={row.totalAmountGrowth} />, enableSorting: true },
    ], [type]);

    const getNestedValue = (obj: any, path: string | symbol): any => {
      const pathStr = String(path);
      if (pathStr.startsWith('custom_')) {
        const parts = pathStr.split('_'); // e.g., ['custom', 'qtySimpati', 'fm1']
        return obj[parts[1]]?.[parts[2].toUpperCase()];
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
        const dataToExport = sortedData.map(row => ({
            'ID Digipos': row.ID_DIGIPOS, 'No RS': row.NO_RS, 'Nama Outlet': row.NAMA_OUTLET, 'Salesforce': row.SALESFORCE, 'TAP': row.TAP, 'Kabupaten': row.KABUPATEN, 'Kecamatan': row.KECAMATAN, 'Flag': row.FLAG,
            'Qty Simpati FM-1': row.qtySimpati.FM_1, 'Qty Simpati M-1': row.qtySimpati.M_1, 'Qty Simpati M': row.qtySimpati.M, 'Qty Simpati Growth (%)': row.qtySimpatiGrowth.toFixed(1),
            'Amount Simpati FM-1': row.amountSimpati.FM_1, 'Amount Simpati M-1': row.amountSimpati.M_1, 'Amount Simpati M': row.amountSimpati.M, 'Amount Simpati Growth (%)': row.amountSimpatiGrowth.toFixed(1),
            'Qty byU FM-1': row.qtyByu.FM_1, 'Qty byU M-1': row.qtyByu.M_1, 'Qty byU M': row.qtyByu.M, 'Qty byU Growth (%)': row.qtyByuGrowth.toFixed(1),
            'Amount byU FM-1': row.amountByu.FM_1, 'Amount byU M-1': row.amountByu.M_1, 'Amount byU M': row.amountByu.M, 'Amount byU Growth (%)': row.amountByuGrowth.toFixed(1),
            'Total Qty FM-1': row.totalQty.FM_1, 'Total Qty M-1': row.totalQty.M_1, 'Total Qty M': row.totalQty.M, 'Total Qty Growth (%)': row.totalQtyGrowth.toFixed(1),
            'Total Amount FM-1': row.totalAmount.FM_1, 'Total Amount M-1': row.totalAmount.M_1, 'Total Amount M': row.totalAmount.M, 'Total Amount Growth (%)': row.totalAmountGrowth.toFixed(1),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `ST Nota ${type}`);
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `st_nota_${type.toLowerCase()}_${date}.xlsx`);
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

export default SellThruNotaPage;
