import React, { useMemo, useState, useEffect } from 'react';
import { getStockVoucherSummary, getStockVoucherDetail } from '../services/api';
import { StockVoucherData, StockVoucherDetailData } from '../types';
import DataTable, { ColumnDef } from '../components/DataTable';
import { PlusCircleIcon, MinusCircleIcon } from '../components/icons';
import LoadingIndicator from '../components/LoadingIndicator';
import CollapsibleSection from '../components/CollapsibleSection';

// For CDN-based xlsx library
declare var XLSX: any;

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// --- HELPER FUNCTIONS FOR CONDITIONAL FORMATTING ---
const getGoodRatioBG = (ratio: number) => {
    if (ratio >= 0.9) return 'bg-green-500 text-white font-bold';
    if (ratio >= 0.75) return 'bg-green-200 text-green-800 font-medium';
    if (ratio >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
};

const getBadRatioBG = (ratio: number) => {
    if (ratio <= 0.1) return 'bg-green-500 text-white font-bold';
    if (ratio <= 0.25) return 'bg-green-200 text-green-800 font-medium';
    if (ratio <= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
};


// --- MAIN PAGE COMPONENT ---
const StockVoucherPage: React.FC = () => {
    // State for summary dashboard
    const [summaryData, setSummaryData] = useState<StockVoucherData[]>([]);
    const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
    const [errorSummary, setErrorSummary] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [expandedTaps, setExpandedTaps] = useState<Record<string, boolean>>({});

    // State for detail data table
    const [detailData, setDetailData] = useState<StockVoucherDetailData[]>([]);
    const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(true);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    // State lifted up from DataTable for detail table
    // FIX: Use the specific 'ProcessedDetailData' type for the sort key to ensure type safety.
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessedDetailData; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchSummaryData = async () => {
            setIsLoadingSummary(true);
            setErrorSummary(null);
            try {
                const summary = await getStockVoucherSummary();
                setSummaryData(summary);
                setLastUpdated(new Date());
            } catch (err) {
                setErrorSummary(err instanceof Error ? err.message : 'Failed to fetch summary data');
            } finally {
                setIsLoadingSummary(false);
            }
        };
        const fetchDetailData = async () => {
            setIsLoadingDetail(true);
            setErrorDetail(null);
            try {
                const detail = await getStockVoucherDetail();
                setDetailData(detail);
            } catch (err) {
                setErrorDetail(err instanceof Error ? err.message : 'Failed to fetch detail data');
            } finally {
                setIsLoadingDetail(false);
            }
        }
        fetchSummaryData();
        fetchDetailData();
    }, []);
    
    // --- SUMMARY DASHBOARD LOGIC ---
    const groupedSummaryData = useMemo(() => {
        return summaryData.reduce((acc, item) => {
            const tap = item.TAP || 'Unknown';
            if (!acc[tap]) acc[tap] = [];
            acc[tap].push(item);
            return acc;
        }, {} as Record<string, StockVoucherData[]>);
    }, [summaryData]);

    const allTapNames = useMemo(() => Object.keys(groupedSummaryData), [groupedSummaryData]);
    
    const isAllExpanded = useMemo(() => {
        if (allTapNames.length === 0) return false;
        return allTapNames.every(tapName => expandedTaps[tapName]);
    }, [expandedTaps, allTapNames]);

    useEffect(() => {
        if (allTapNames.length > 0) {
            const initialExpandedState: Record<string, boolean> = {};
            allTapNames.forEach(tap => {
                initialExpandedState[tap] = true;
            });
            setExpandedTaps(initialExpandedState);
        }
    }, [allTapNames]);
    
    const toggleTap = (tapName: string) => {
        setExpandedTaps(prev => ({ ...prev, [tapName]: !prev[tapName] }));
    };

    const handleToggleAll = () => {
        const newState = !isAllExpanded;
        const newExpandedState: Record<string, boolean> = {};
        allTapNames.forEach(tapName => {
            newExpandedState[tapName] = newState;
        });
        setExpandedTaps(newExpandedState);
    };

    const calculateTotals = (items: StockVoucherData[]) => {
        const totals = items.reduce((acc, item) => {
            (Object.keys(item) as Array<keyof StockVoucherData>).forEach(key => {
                if (typeof item[key] === 'number' && key !== 'STOCK_GT_0_RATE_PJP' && key !== 'STOCK_0_TO_OUTLET_RATE' && key !== 'STOCK_0_TO_OUTLET_PJP_RATE') {
                   (acc as any)[key] = ((acc as any)[key] || 0) + item[key];
                }
            });
            return acc;
        }, {} as Partial<StockVoucherData>);
        if (totals.PJP && totals.PJP > 0) totals.STOCK_GT_0_RATE_PJP = (totals.STOCK_GT_0_OUTLET ?? 0) / totals.PJP; else totals.STOCK_GT_0_RATE_PJP = 0;
        if (totals.SELLTHRU_OUTLET && totals.SELLTHRU_OUTLET > 0) totals.STOCK_0_TO_OUTLET_RATE = (totals.STOCK_0_TO_OUTLET_BELANJA ?? 0) / totals.SELLTHRU_OUTLET; else totals.STOCK_0_TO_OUTLET_RATE = 0;
        if (totals.PJP && totals.PJP > 0) totals.STOCK_0_TO_OUTLET_PJP_RATE = (totals.STOCK_0_TO_OUTLET_PJP ?? 0) / totals.PJP; else totals.STOCK_0_TO_OUTLET_PJP_RATE = 0;
        return totals;
    };
    
    const grandTotal = useMemo(() => calculateTotals(summaryData), [summaryData]);
    
    const renderSummaryDataRow = (item: Partial<StockVoucherData>, isTotal = false, tapName = '') => {
      const rowStyle = isTotal ? "font-bold bg-slate-100 text-slate-900" : "bg-white";
      const name = isTotal ? tapName : item.SALESFORCE;
      const tap = isTotal ? "" : item.TAP;
      return (
        <tr key={`${tapName}-${name}`} className={`border-b text-gray-800 text-sm text-center ${rowStyle}`}>
          <td className="px-2 py-1.5 whitespace-nowrap text-left">{name}</td>
          <td className="px-2 py-1.5 whitespace-nowrap text-left">{tap}</td>
          <td className="px-2 py-1.5">{item.PJP?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.SELLTHRU_OUTLET?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{(item.SELLTHRU_QTY ?? 0).toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_GT_0_OUTLET?.toLocaleString()}</td>
          <td className={`px-2 py-1.5 ${getGoodRatioBG(item.STOCK_GT_0_RATE_PJP ?? 0)}`}>{((item.STOCK_GT_0_RATE_PJP ?? 0) * 100).toFixed(1)}%</td>
          <td className="px-2 py-1.5">{item.STOCK_GT_0_QTY_OUTLET?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_0_TO_OUTLET_BELANJA?.toLocaleString() || '-'}</td>
          <td className={`px-2 py-1.5 ${getBadRatioBG(item.STOCK_0_TO_OUTLET_RATE ?? 0)}`}>{((item.STOCK_0_TO_OUTLET_RATE ?? 0) * 100).toFixed(1)}%</td>
          <td className="px-2 py-1.5">{item.STOCK_0_TO_OUTLET_PJP?.toLocaleString() || '-'}</td>
          <td className={`px-2 py-1.5 ${getBadRatioBG(item.STOCK_0_TO_OUTLET_PJP_RATE ?? 0)}`}>{((item.STOCK_0_TO_OUTLET_PJP_RATE ?? 0) * 100).toFixed(1)}%</td>
          <td className="px-2 py-1.5">{item.STOCK_DAYS_SO_DAILY?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_DAYS_STOCK_DAYS?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_PER_QTY_1?.toLocaleString() || '-'}</td>
          <td className="px-2 py-1.5">{item.STOCK_PER_QTY_2_5?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_PER_QTY_6_10?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_PER_QTY_11_20?.toLocaleString()}</td>
          <td className="px-2 py-1.5">{item.STOCK_PER_QTY_GT_20?.toLocaleString()}</td>
        </tr>
      );
    };

    // --- DETAIL TABLE LOGIC ---
    type ProcessedDetailData = StockVoucherDetailData & { simpatiGrowth: number; byuGrowth: number; status: string; };

    const processedDetailData = useMemo((): ProcessedDetailData[] => {
      return detailData.map(item => ({
        ...item,
        simpatiGrowth: item.SIMPATI_M_1 > 0 ? ((item.SIMPATI_M - item.SIMPATI_M_1) / item.SIMPATI_M_1) * 100 : 0,
        byuGrowth: item.BYU_M_1 > 0 ? ((item.BYU_M - item.BYU_M_1) / item.BYU_M_1) * 100 : 0,
        status: item.SISA_STOCK < 5 ? 'Push Order' : 'Sudah Cukup'
      }));
    }, [detailData]);

    const StatusCell: React.FC<{ value: string }> = ({ value }) => (
      <span className={`font-bold ${value === 'Push Order' ? 'text-red-600' : 'text-green-600'}`}>{value}</span>
    );

    const GrowthCell: React.FC<{ value: number }> = ({ value }) => (
      <span className={`font-semibold flex items-center justify-end gap-1 ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value.toFixed(2)}% {value >= 0 ? '▲' : '▼'}
      </span>
    );
    
    const detailColumns = useMemo<ColumnDef<ProcessedDetailData>[]>(() => [
        { accessorKey: 'ID_DIGIOS', header: 'ID Digios', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NO_RS', header: 'No RS', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NAMA_OUTLET', header: 'Nama Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'TAP', header: 'TAP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'SALESFORCE', header: 'Salesforce', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KABUPATEN', header: 'Kabupaten', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KECAMATAN', header: 'Kecamatan', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'HARI_PJP', header: 'Hari PJP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'SIMPATI_FM_1', header: 'FM-1', group: 'Simpati', align: 'right', cell: (row) => row.SIMPATI_FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'SIMPATI_M_1', header: 'M-1', group: 'Simpati', align: 'right', cell: (row) => row.SIMPATI_M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'SIMPATI_M', header: 'M', group: 'Simpati', align: 'right', cell: (row) => row.SIMPATI_M.toLocaleString(), enableSorting: true },
        { accessorKey: 'simpatiGrowth', header: 'Growth', group: 'Simpati', align: 'right', cell: (row) => <GrowthCell value={row.simpatiGrowth} />, enableSorting: true },
        { accessorKey: 'BYU_FM_1', header: 'FM-1', group: 'byU', align: 'right', cell: (row) => row.BYU_FM_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'BYU_M_1', header: 'M-1', group: 'byU', align: 'right', cell: (row) => row.BYU_M_1.toLocaleString(), enableSorting: true },
        { accessorKey: 'BYU_M', header: 'M', group: 'byU', align: 'right', cell: (row) => row.BYU_M.toLocaleString(), enableSorting: true },
        { accessorKey: 'byuGrowth', header: 'Growth', group: 'byU', align: 'right', cell: (row) => <GrowthCell value={row.byuGrowth} />, enableSorting: true },
        { accessorKey: 'TOTAL_PEMBELIAN', header: 'Total Pembelian', enableSorting: true, align: 'right', cell: (row) => row.TOTAL_PEMBELIAN.toLocaleString() },
        { accessorKey: 'TOTAL_SELLOUT_BARCODE', header: 'Total Sellout Barcode', enableSorting: true, align: 'right', cell: (row) => row.TOTAL_SELLOUT_BARCODE.toLocaleString() },
        { accessorKey: 'TOTAL_SO_PAYLOAD', header: 'Total SO Payload', enableSorting: true, align: 'right', cell: (row) => row.TOTAL_SO_PAYLOAD.toLocaleString() },
        { accessorKey: 'SISA_STOCK', header: 'Sisa Stock', enableSorting: true, align: 'right', cell: (row) => row.SISA_STOCK.toLocaleString() },
        { accessorKey: 'status', header: 'Status', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left', cell: (row) => <StatusCell value={row.status} /> },
    ], []);

    const uniqueOptions = useMemo(() => {
        const options: Record<string, Set<string>> = {};
        detailColumns.forEach(col => {
            const key = col.accessorKey as keyof ProcessedDetailData;
            if (col.filterType === 'select') {
                options[key as string] = new Set(processedDetailData.map(item => String(item[key])));
            }
        });
        return options;
    }, [processedDetailData, detailColumns]);

    const filteredData = useMemo(() => {
        return processedDetailData.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const itemValue = String(item[key as keyof ProcessedDetailData] ?? '').toLowerCase();
                const filterValue = String(value).toLowerCase();
                const colDef = detailColumns.find(c => c.accessorKey === key);
                if (colDef?.filterType === 'select') return itemValue === filterValue;
                return itemValue.includes(filterValue);
            });
        });
    }, [processedDetailData, filters, detailColumns]);
    
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key as keyof ProcessedDetailData];
            const bValue = b[sortConfig.key as keyof ProcessedDetailData];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // FIX: Add missing handleSort and handleFilterChange functions and type them correctly.
    const handleSort = (key: keyof ProcessedDetailData) => setSortConfig(c => ({ key, direction: c && c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));
    const handleFilterChange = (key: keyof ProcessedDetailData, value: string) => { setFilters(p => ({ ...p, [key as string]: value })); };

    const handleExport = () => {
        const dataToExport = sortedData.map(row => ({
            'ID Digios': row.ID_DIGIOS,
            'No RS': row.NO_RS,
            'Nama Outlet': row.NAMA_OUTLET,
            'TAP': row.TAP,
            'Salesforce': row.SALESFORCE,
            'Kabupaten': row.KABUPATEN,
            'Kecamatan': row.KECAMATAN,
            'Hari PJP': row.HARI_PJP,
            'Simpati FM-1': row.SIMPATI_FM_1,
            'Simpati M-1': row.SIMPATI_M_1,
            'Simpati M': row.SIMPATI_M,
            'Simpati Growth (%)': row.simpatiGrowth.toFixed(2),
            'byU FM-1': row.BYU_FM_1,
            'byU M-1': row.BYU_M_1,
            'byU M': row.BYU_M,
            'byU Growth (%)': row.byuGrowth.toFixed(2),
            'Total Pembelian': row.TOTAL_PEMBELIAN,
            'Total Sellout Barcode': row.TOTAL_SELLOUT_BARCODE,
            'Total SO Payload': row.TOTAL_SO_PAYLOAD,
            'Sisa Stock': row.SISA_STOCK,
            'Status': row.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Stock Voucher");
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `detail_stock_voucher_${date}.xlsx`);
    };

    if (isLoadingSummary || isLoadingDetail) return <LoadingIndicator type="table" tableColumns={8} text="Memuat data stok voucher..." />;
    if (errorSummary || errorDetail) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {errorSummary || errorDetail}</div>;

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-800">Stock Voucher</h1>
                 {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                        Data diperbarui pada: {lastUpdated.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
            
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Summary Dashboard</h2>
                 <div className="mb-3">
                    <button onClick={handleToggleAll} className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        {isAllExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-xs whitespace-nowrap">
                        <thead className="text-white align-middle text-center">
                            <tr>
                                <th rowSpan={3} className="px-2 py-2 border-r border-red-600 bg-red-700">SALESFORCE</th>
                                <th rowSpan={3} className="px-2 py-2 border-r border-red-600 bg-red-700">TAP</th>
                                <th rowSpan={3} className="px-2 py-2 border-r border-red-600 bg-red-700">PJP</th>
                                <th colSpan={2} className="px-2 py-2 border-r border-red-600 bg-red-700">SELLTHRU</th>
                                <th colSpan={7} className="px-2 py-2 border-r border-red-600 bg-red-700">ESTIMASI SISA STOCK by ST SO</th>
                                <th colSpan={2} className="px-2 py-2 border-r border-red-600 bg-red-700">STOCK DAYS</th>
                                <th colSpan={5} className="px-2 py-2 bg-red-700">STOCK PER QTY</th>
                            </tr>
                            <tr className="bg-red-600">
                                <th colSpan={2} className="px-2 py-1 border-r border-red-500"></th>
                                <th colSpan={3} className="px-2 py-1 border-r border-red-500">STOCK > 0</th>
                                <th colSpan={4} className="px-2 py-1 border-r border-red-500">STOCK 0</th>
                                <th colSpan={2} className="px-2 py-1 border-r border-red-500"></th>
                                <th colSpan={5} className="px-2 py-1"></th>
                            </tr>
                            <tr className="bg-red-500">
                                <th className="px-2 py-2 font-normal border-r border-red-400">Outlet Belanja</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">Qty Belanja</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">Outlet</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400 min-w-[100px]">Rate to PJP</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">Qty / Outlet</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">to Outlet Belanja</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">Rate</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">to Outlet PJP</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">Rate</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">SO Daily</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">Stock Days</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">1</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">2 - 5</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">6 - 10</th>
                                <th className="px-2 py-2 font-normal border-r border-red-400">11 - 20</th>
                                <th className="px-2 py-2 font-normal">>20</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedSummaryData).sort().map(tapName => {
                                const itemsInTap = groupedSummaryData[tapName];
                                const tapTotal = calculateTotals(itemsInTap);
                                return (
                                    <React.Fragment key={tapName}>
                                        {expandedTaps[tapName] && itemsInTap.map(item => renderSummaryDataRow(item))}
                                        {(() => {
                                            const rowStyle = "font-bold bg-slate-100 text-slate-900";
                                            return (
                                                <tr className={`border-b text-gray-800 text-sm text-center ${rowStyle}`}>
                                                    <td className="px-2 py-1.5 whitespace-nowrap text-left flex items-center gap-2">
                                                        <button onClick={() => toggleTap(tapName)} className="p-0.5 rounded-full hover:bg-slate-300">
                                                            {expandedTaps[tapName] ? <MinusCircleIcon className="w-4 h-4 text-slate-800" /> : <PlusCircleIcon className="w-4 h-4 text-slate-800" />}
                                                        </button>
                                                        {`TOTAL ${tapName.toUpperCase()}`}
                                                    </td>
                                                    <td className="px-2 py-1.5 whitespace-nowrap text-left"></td>
                                                    <td className="px-2 py-1.5">{tapTotal.PJP?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.SELLTHRU_OUTLET?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{(tapTotal.SELLTHRU_QTY ?? 0).toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_GT_0_OUTLET?.toLocaleString()}</td>
                                                    <td className={`px-2 py-1.5 ${getGoodRatioBG(tapTotal.STOCK_GT_0_RATE_PJP ?? 0)}`}>{((tapTotal.STOCK_GT_0_RATE_PJP ?? 0) * 100).toFixed(1)}%</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_GT_0_QTY_OUTLET?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_0_TO_OUTLET_BELANJA?.toLocaleString() || '-'}</td>
                                                    <td className={`px-2 py-1.5 ${getBadRatioBG(tapTotal.STOCK_0_TO_OUTLET_RATE ?? 0)}`}>{((tapTotal.STOCK_0_TO_OUTLET_RATE ?? 0) * 100).toFixed(1)}%</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_0_TO_OUTLET_PJP?.toLocaleString() || '-'}</td>
                                                    <td className={`px-2 py-1.5 ${getBadRatioBG(tapTotal.STOCK_0_TO_OUTLET_PJP_RATE ?? 0)}`}>{((tapTotal.STOCK_0_TO_OUTLET_PJP_RATE ?? 0) * 100).toFixed(1)}%</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_DAYS_SO_DAILY?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_DAYS_STOCK_DAYS?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_PER_QTY_1?.toLocaleString() || '-'}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_PER_QTY_2_5?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_PER_QTY_6_10?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_PER_QTY_11_20?.toLocaleString()}</td>
                                                    <td className="px-2 py-1.5">{tapTotal.STOCK_PER_QTY_GT_20?.toLocaleString()}</td>
                                                </tr>
                                            );
                                        })()}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        <tfoot>{renderSummaryDataRow(grandTotal, true, 'TOTAL CLUSTER')}</tfoot>
                    </table>
                </div>
            </div>

            <CollapsibleSection title="Detail Data Stock Voucher">
                <div className="space-y-4">
                    <div className="flex justify-end">
                         <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors">
                            <DownloadIcon className="w-5 h-5" />
                            <span>Export ke Excel</span>
                        </button>
                    </div>
                    <DataTable 
                        columns={detailColumns} 
                        data={sortedData}
                        sortConfig={sortConfig}
                        filters={filters}
                        uniqueOptions={uniqueOptions}
                        onSort={handleSort}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default StockVoucherPage;
