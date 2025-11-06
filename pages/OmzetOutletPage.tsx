import React, { useMemo, useState, useEffect } from 'react';
import { getOmzetOutletDetail } from '../services/api';
import { OmzetOutletData } from '../types';
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

interface SummaryRow {
    type: 'sf' | 'tap_total' | 'grand_total';
    key: string;
    salesforce: string;
    tap: string;
    pjp: number;
    oaFm1: number;
    oaM1: number;
    oaM: number;
    oaGrowth: number;
    oaRatePjp: number;
    omzetFm1: number;
    omzetM1: number;
    omzetM: number;
    omzetGrowth: number;
}

const OmzetOutletPage: React.FC = () => {
    const [detailData, setDetailData] = useState<OmzetOutletData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTaps, setExpandedTaps] = useState<Record<string, boolean>>({});

    // FIX: Use the specific 'ProcessedData' type for the sort key to ensure type safety.
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessedData; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        const fetchDetailData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const detail = await getOmzetOutletDetail();
                setDetailData(detail);
                setLastUpdated(new Date());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch detail data');
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetailData();
    }, []);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous);
    };

    const dateFilteredData = useMemo(() => {
        if (!startDate && !endDate) return detailData;
        return detailData.filter(item => {
            const itemDate = new Date(item.TRANSACTION_DATE);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && itemDate < start) return false;
            if (end) {
                end.setHours(23, 59, 59, 999); // Include the whole end day
                if (itemDate > end) return false;
            }
            return true;
        });
    }, [detailData, startDate, endDate]);

    const summaryData = useMemo<SummaryRow[]>(() => {
        if (!dateFilteredData || dateFilteredData.length === 0) return [];
        
        // FIX: Explicitly cast the initial value of reduce to ensure TypeScript correctly infers the accumulator type.
        const groupedByTap = dateFilteredData.reduce((acc, outlet) => {
            const tap = outlet.TAP || 'Unknown';
            if (!(acc as any)[tap]) {
                (acc as any)[tap] = [];
            }
            (acc as any)[tap].push(outlet);
            return acc;
        }, {} as Record<string, OmzetOutletData[]>);

        const processedList: SummaryRow[] = [];
        const sortedTaps = Object.keys(groupedByTap).sort();

        for (const tap of sortedTaps) {
            const outletsInTap = groupedByTap[tap];
            // FIX: Explicitly cast the initial value of reduce to ensure TypeScript correctly infers the accumulator type.
            const groupedBySf = outletsInTap.reduce((acc, outlet) => {
                const sf = outlet.SALESFORCE || 'Unknown';
                if (!(acc as any)[sf]) {
                    (acc as any)[sf] = [];
                }
                (acc as any)[sf].push(outlet);
                return acc;
            }, {} as Record<string, OmzetOutletData[]>);

            const sfRows: SummaryRow[] = Object.entries(groupedBySf).map(([sfCode, outlets]) => {
                const pjp = outlets.length;
                const oaFm1 = outlets.filter(o => o.TOTAL_OMZET_FM_1 > 0).length;
                const oaM1 = outlets.filter(o => o.TOTAL_OMZET_M_1 > 0).length;
                const oaM = outlets.filter(o => o.TOTAL_OMZET_M > 0).length;
                const omzetFm1 = outlets.reduce((sum, o) => sum + o.TOTAL_OMZET_FM_1, 0);
                const omzetM1 = outlets.reduce((sum, o) => sum + o.TOTAL_OMZET_M_1, 0);
                const omzetM = outlets.reduce((sum, o) => sum + o.TOTAL_OMZET_M, 0);

                return {
                    type: 'sf' as const,
                    key: `${tap}-${sfCode}`,
                    salesforce: sfCode,
                    tap,
                    pjp,
                    oaFm1,
                    oaM1,
                    oaM,
                    oaGrowth: calculateGrowth(oaM, oaM1),
                    oaRatePjp: pjp > 0 ? oaM / pjp : 0,
                    omzetFm1,
                    omzetM1,
                    omzetM,
                    omzetGrowth: calculateGrowth(omzetM, omzetM1),
                };
            }).sort((a,b) => a.salesforce.localeCompare(b.salesforce));

            processedList.push(...sfRows);
            
            const tapTotal = sfRows.reduce((acc, curr) => {
                acc.pjp += curr.pjp;
                acc.oaFm1 += curr.oaFm1;
                acc.oaM1 += curr.oaM1;
                acc.oaM += curr.oaM;
                acc.omzetFm1 += curr.omzetFm1;
                acc.omzetM1 += curr.omzetM1;
                acc.omzetM += curr.omzetM;
                return acc;
            }, { pjp: 0, oaFm1: 0, oaM1: 0, oaM: 0, omzetFm1: 0, omzetM1: 0, omzetM: 0 });

            processedList.push({
                type: 'tap_total',
                key: `${tap}-total`,
                salesforce: `TOTAL ${tap.toUpperCase()}`,
                tap: '',
                ...tapTotal,
                oaGrowth: calculateGrowth(tapTotal.oaM, tapTotal.oaM1),
                oaRatePjp: tapTotal.pjp > 0 ? tapTotal.oaM / tapTotal.pjp : 0,
                omzetGrowth: calculateGrowth(tapTotal.omzetM, tapTotal.omzetM1),
            });
        }
        
        const grandTotal = processedList.filter(r => r.type === 'tap_total').reduce((acc, curr) => {
            acc.pjp += curr.pjp;
            acc.oaFm1 += curr.oaFm1;
            acc.oaM1 += curr.oaM1;
            acc.oaM += curr.oaM;
            acc.omzetFm1 += curr.omzetFm1;
            acc.omzetM1 += curr.omzetM1;
            acc.omzetM += curr.omzetM;
            return acc;
        }, { pjp: 0, oaFm1: 0, oaM1: 0, oaM: 0, omzetFm1: 0, omzetM1: 0, omzetM: 0 });

        processedList.push({
            type: 'grand_total',
            key: 'grand-total',
            salesforce: 'TOTAL CLUSTER',
            tap: '',
            ...grandTotal,
            oaGrowth: calculateGrowth(grandTotal.oaM, grandTotal.oaM1),
            oaRatePjp: grandTotal.pjp > 0 ? grandTotal.oaM / grandTotal.pjp : 0,
            omzetGrowth: calculateGrowth(grandTotal.omzetM, grandTotal.omzetM1),
        });

        return processedList;

    }, [dateFilteredData]);

    const allTapNames = useMemo(() => 
        summaryData
            .filter(row => row.type === 'tap_total')
            .map(row => row.salesforce.replace('TOTAL ', '').trim()),
        [summaryData]
    );

    const isAllExpanded = useMemo(() => {
        if (allTapNames.length === 0) return false;
        return allTapNames.every(tapName => expandedTaps[tapName]);
    }, [expandedTaps, allTapNames]);

    const handleToggleAll = () => {
        const newState = !isAllExpanded;
        const newExpandedState: Record<string, boolean> = {};
        allTapNames.forEach(tapName => {
            newExpandedState[tapName] = newState;
        });
        setExpandedTaps(newExpandedState);
    };

    useEffect(() => {
        if (allTapNames.length > 0) {
            const initialExpandedState: Record<string, boolean> = {};
            allTapNames.forEach(tapName => {
                initialExpandedState[tapName] = true;
            });
            setExpandedTaps(initialExpandedState);
        }
    }, [allTapNames]);
    
    const toggleTap = (tapName: string) => {
        setExpandedTaps(prev => ({...prev, [tapName]: !prev[tapName]}));
    };

    const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

    const GrowthCell: React.FC<{ value: number }> = ({ value }) => {
      if (value === Infinity) return <span className="font-semibold text-green-600">New ▲</span>;
      const displayValue = (value * 100).toFixed(1);
      return (
        <span className={`font-semibold flex items-center justify-center gap-1 ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {displayValue}% {value >= 0 ? '▲' : '▼'}
        </span>
      );
    };

    const getRatioColor = (ratio: number) => {
        if (ratio >= 0.9) return 'bg-green-500 text-white font-bold';
        if (ratio >= 0.75) return 'bg-green-200 text-green-800 font-medium';
        if (ratio >= 0.5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    
    type ProcessedData = OmzetOutletData & {
        rechargeGrowth: number;
        injectVfGrowth: number;
        stGrowth: number;
        totalOmzetGrowth: number;
    };

    const processedData = useMemo((): ProcessedData[] => {
      return dateFilteredData.map(item => ({
          ...item,
          rechargeGrowth: calculateGrowth(item.RECHARGE_M, item.RECHARGE_M_1) * 100,
          injectVfGrowth: calculateGrowth(item.INJECT_VF_M, item.INJECT_VF_M_1) * 100,
          stGrowth: calculateGrowth(item.ST_M, item.ST_M_1) * 100,
          totalOmzetGrowth: calculateGrowth(item.TOTAL_OMZET_M, item.TOTAL_OMZET_M_1) * 100,
        })
      );
    }, [dateFilteredData]);
    
    const columns = useMemo<ColumnDef<ProcessedData>[]>(() => [
        { accessorKey: 'ID_OUTLET', header: 'ID Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NO_RS', header: 'No RS', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NAMA_OUTLET', header: 'Nama Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'TAP', header: 'TAP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'SALESFORCE', header: 'Salesforce', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KABUPATEN', header: 'Kabupaten', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KECAMATAN', header: 'Kecamatan', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'HARI_PJP', header: 'Hari PJP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        
        { accessorKey: 'RECHARGE_FM_1', header: 'FM-1', group: 'Recharge', align: 'right', cell: (row) => formatCurrency(row.RECHARGE_FM_1), enableSorting: true },
        { accessorKey: 'RECHARGE_M_1', header: 'M-1', group: 'Recharge', align: 'right', cell: (row) => formatCurrency(row.RECHARGE_M_1), enableSorting: true },
        { accessorKey: 'RECHARGE_M', header: 'M', group: 'Recharge', align: 'right', cell: (row) => formatCurrency(row.RECHARGE_M), enableSorting: true },
        { accessorKey: 'rechargeGrowth', header: 'Growth', group: 'Recharge', align: 'right', cell: (row) => <GrowthCell value={row.rechargeGrowth / 100} />, enableSorting: true },

        { accessorKey: 'INJECT_VF_FM_1', header: 'FM-1', group: 'Inject VF', align: 'right', cell: (row) => formatCurrency(row.INJECT_VF_FM_1), enableSorting: true },
        { accessorKey: 'INJECT_VF_M_1', header: 'M-1', group: 'Inject VF', align: 'right', cell: (row) => formatCurrency(row.INJECT_VF_M_1), enableSorting: true },
        { accessorKey: 'INJECT_VF_M', header: 'M', group: 'Inject VF', align: 'right', cell: (row) => formatCurrency(row.INJECT_VF_M), enableSorting: true },
        { accessorKey: 'injectVfGrowth', header: 'Growth', group: 'Inject VF', align: 'right', cell: (row) => <GrowthCell value={row.injectVfGrowth / 100} />, enableSorting: true },

        { accessorKey: 'ST_FM_1', header: 'ST', group: 'ST', align: 'right', cell: (row) => formatCurrency(row.ST_FM_1), enableSorting: true },
        { accessorKey: 'ST_M_1', header: 'M-1', group: 'ST', align: 'right', cell: (row) => formatCurrency(row.ST_M_1), enableSorting: true },
        { accessorKey: 'ST_M', header: 'M', group: 'ST', align: 'right', cell: (row) => formatCurrency(row.ST_M), enableSorting: true },
        { accessorKey: 'stGrowth', header: 'Growth', group: 'ST', align: 'right', cell: (row) => <GrowthCell value={row.stGrowth / 100} />, enableSorting: true },

        { accessorKey: 'TOTAL_OMZET_FM_1', header: 'FM-1', group: 'Total Omzet', align: 'right', cell: (row) => formatCurrency(row.TOTAL_OMZET_FM_1), enableSorting: true },
        { accessorKey: 'TOTAL_OMZET_M_1', header: 'M-1', group: 'Total Omzet', align: 'right', cell: (row) => formatCurrency(row.TOTAL_OMZET_M_1), enableSorting: true },
        { accessorKey: 'TOTAL_OMZET_M', header: 'M', group: 'Total Omzet', align: 'right', cell: (row) => formatCurrency(row.TOTAL_OMZET_M), enableSorting: true },
        { accessorKey: 'totalOmzetGrowth', header: 'Growth', group: 'Total Omzet', align: 'right', cell: (row) => <GrowthCell value={row.totalOmzetGrowth / 100} />, enableSorting: true },

    ], []);

    const uniqueOptions = useMemo(() => {
        const options: Record<string, Set<string>> = {};
        columns.forEach(col => {
            const key = col.accessorKey as keyof ProcessedData;
            if (col.filterType === 'select') {
                options[key as string] = new Set(processedData.map(item => String(item[key])));
            }
        });
        return options;
    }, [processedData, columns]);

    const filteredData = useMemo(() => {
        return processedData.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const itemValue = String(item[key as keyof ProcessedData] ?? '').toLowerCase();
                const filterValue = String(value).toLowerCase();
                const colDef = columns.find(c => c.accessorKey === key);
                if (colDef?.filterType === 'select') return itemValue === filterValue;
                return itemValue.includes(filterValue);
            });
        });
    }, [processedData, filters, columns]);
    
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key as keyof ProcessedData];
            const bValue = b[sortConfig.key as keyof ProcessedData];
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // FIX: Type the key parameter with the specific 'keyof ProcessedData' to ensure type safety.
    const handleSort = (key: keyof ProcessedData) => setSortConfig(c => ({ key, direction: c && c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));
    const handleFilterChange = (key: keyof ProcessedData, value: string) => { setFilters(p => ({ ...p, [key as string]: value })); };

    const handleExport = () => {
        const dataToExport = sortedData.map(row => ({
            'ID Outlet': row.ID_OUTLET,
            'No RS': row.NO_RS,
            'Nama Outlet': row.NAMA_OUTLET,
            'TAP': row.TAP,
            'Salesforce': row.SALESFORCE,
            'Kabupaten': row.KABUPATEN,
            'Kecamatan': row.KECAMATAN,
            'Hari PJP': row.HARI_PJP,
            'Recharge FM-1': row.RECHARGE_FM_1,
            'Recharge M-1': row.RECHARGE_M_1,
            'Recharge M': row.RECHARGE_M,
            'Recharge Growth (%)': row.rechargeGrowth.toFixed(2),
            'Inject VF FM-1': row.INJECT_VF_FM_1,
            'Inject VF M-1': row.INJECT_VF_M_1,
            'Inject VF M': row.INJECT_VF_M,
            'Inject VF Growth (%)': row.injectVfGrowth.toFixed(2),
            'ST FM-1': row.ST_FM_1,
            'ST M-1': row.ST_M_1,
            'ST M': row.ST_M,
            'ST Growth (%)': row.stGrowth.toFixed(2),
            'Total Omzet FM-1': row.TOTAL_OMZET_FM_1,
            'Total Omzet M-1': row.TOTAL_OMZET_M_1,
            'Total Omzet M': row.TOTAL_OMZET_M,
            'Total Omzet Growth (%)': row.totalOmzetGrowth.toFixed(2),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Omzet Outlet");
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `detail_omzet_outlet_${date}.xlsx`);
    };

    if (isLoading) return <LoadingIndicator type="table" tableColumns={7} text="Memuat data omzet..." />;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    const renderSummaryRow = (row: SummaryRow) => {
        let rowClass = 'border-b text-gray-800 text-sm text-center';
        const isTapTotal = row.type === 'tap_total';
        const isGrandTotal = row.type === 'grand_total';
        const isSF = row.type === 'sf';
        
        if (isTapTotal) rowClass += ' font-bold bg-slate-100 text-slate-900';
        if (isGrandTotal) rowClass += ' font-extrabold bg-red-700 text-white';

        const tapNameForToggle = isTapTotal ? row.salesforce.replace('TOTAL ', '').trim() : '';

        if (isSF && !expandedTaps[row.tap.toUpperCase()]) {
            return null;
        }

        return(
            <tr key={row.key} className={rowClass}>
                <td className="px-2 py-1.5 whitespace-nowrap text-left">
                    <div className="flex items-center gap-2">
                        {isTapTotal && (
                            <button onClick={() => toggleTap(tapNameForToggle)} className="p-0.5 rounded-full hover:bg-slate-300">
                                {expandedTaps[tapNameForToggle] ? <MinusCircleIcon className="w-4 h-4 text-slate-800" /> : <PlusCircleIcon className="w-4 h-4 text-slate-800" />}
                            </button>
                        )}
                        {row.salesforce}
                    </div>
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-left">{row.tap}</td>
                <td className="px-2 py-1.5">{row.pjp.toLocaleString()}</td>
                <td className="px-2 py-1.5">{row.oaFm1.toLocaleString()}</td>
                <td className="px-2 py-1.5">{row.oaM1.toLocaleString()}</td>
                <td className="px-2 py-1.5">{row.oaM.toLocaleString()}</td>
                <td className="px-2 py-1.5"><GrowthCell value={row.oaGrowth} /></td>
                <td className={`px-2 py-1.5 ${getRatioColor(row.oaRatePjp)}`}>{(row.oaRatePjp * 100).toFixed(1)}%</td>
                <td className="px-2 py-1.5 text-right">{formatCurrency(row.omzetFm1)}</td>
                <td className="px-2 py-1.5 text-right">{formatCurrency(row.omzetM1)}</td>
                <td className="px-2 py-1.5 text-right">{formatCurrency(row.omzetM)}</td>
                <td className="px-2 py-1.5"><GrowthCell value={row.omzetGrowth} /></td>
            </tr>
        )
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-800">Omzet Outlet</h1>
                {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                        Data diperbarui pada: {lastUpdated.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-white rounded-lg flex flex-wrap items-center gap-x-4 gap-y-2">
                <h3 className="text-md font-semibold text-gray-700">Filter Periode</h3>
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm font-medium">Dari:</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-48 p-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm font-medium">Sampai:</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-48 p-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500" />
                </div>
                <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
                    Clear Filter
                </button>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Summary per Sales Force</h2>
                <div className="mb-3">
                    <button onClick={handleToggleAll} className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        {isAllExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-xs whitespace-nowrap">
                        <thead className="text-white align-middle text-center uppercase">
                            <tr>
                                <th rowSpan={2} className="px-2 py-2 bg-red-700 border-r border-red-600">Nama Salesforce</th>
                                <th rowSpan={2} className="px-2 py-2 bg-red-700 border-r border-red-600">Nama TAP</th>
                                <th rowSpan={2} className="px-2 py-2 bg-red-700 border-r border-red-600">PJP</th>
                                <th colSpan={5} className="px-2 py-2 bg-red-700 border-r border-red-600">Outlet Aktif</th>
                                <th colSpan={4} className="px-2 py-2 bg-red-700">Omzet</th>
                            </tr>
                            <tr className="bg-red-600">
                                <th className="px-2 py-2 font-normal border-r border-red-500">OA FM-1</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">OA M-1</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">OA M</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">Growth</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">Rate PJP</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">FM-1</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">M-1</th>
                                <th className="px-2 py-2 font-normal border-r border-red-500">M</th>
                                <th className="px-2 py-2 font-normal">Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaryData.filter(r => r.type !== 'grand_total').map(row => renderSummaryRow(row))}
                        </tbody>
                        <tfoot>
                            {summaryData.filter(r => r.type === 'grand_total').map(row => renderSummaryRow(row))}
                        </tfoot>
                    </table>
                </div>
            </div>
            <CollapsibleSection title="Detail Omzet Outlet">
                <div className="space-y-4">
                    <div className="flex justify-end">
                         <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors">
                            <DownloadIcon className="w-5 h-5" />
                            <span>Export ke Excel</span>
                        </button>
                    </div>
                    <DataTable 
                        columns={columns} 
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

export default OmzetOutletPage;
