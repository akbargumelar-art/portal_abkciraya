import React, { useState, useEffect, useMemo } from 'react';
import { getSalesPlanVoucherData } from '../services/api';
import { SalesPlanVoucherData, SalesPlanPeriodData, SalesPlanProductData } from '../types';
import { PlusCircleIcon, MinusCircleIcon } from '../components/icons';
import DataTable, { ColumnDef } from '../components/DataTable';
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

// --- TYPE DEFINITIONS FOR SUMMARY TABLE ---
interface SummaryMetric {
  target: number;
  m_minus_1: number; // M-1 data
  m: number;
  achv: number;
  mom: number;
}
interface SummaryRow {
  type: 'sf' | 'tap_total' | 'grand_total';
  key: string;
  salesforce: string;
  tap: string;
  pjp: number;
  oaSimpati: SummaryMetric;
  qtySimpati: SummaryMetric;
  oaByu: SummaryMetric;
  qtyByu: SummaryMetric;
  oaTotal: SummaryMetric;
  qtyTotal: SummaryMetric;
}

const SalesPlanVoucherPage: React.FC = () => {
    const [data, setData] = useState<SalesPlanVoucherData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // FIX: Use the specific 'ProcessedData' type for the sort key to ensure type safety.
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProcessedData; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedPeriod, setSelectedPeriod] = useState('Total');
    const [selectedFlag, setSelectedFlag] = useState<string>('');
    const [selectedValidity, setSelectedValidity] = useState<string>('');
    const [selectedPaket, setSelectedPaket] = useState<string>('');
    const [expandedTaps, setExpandedTaps] = useState<Record<string, boolean>>({});
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getSalesPlanVoucherData();
                setData(result);
                setLastUpdated(new Date());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const uniqueFlags = useMemo(() => Array.from(new Set(data.map(item => item.FLAG))), [data]);
    const uniqueValidities = useMemo(() => Array.from(new Set(data.map(item => item.VALIDITY))), [data]);
    const uniquePakets = useMemo(() => Array.from(new Set(data.map(item => item.PAKET))), [data]);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedFlag('');
        setSelectedValidity('');
        setSelectedPaket('');
        setSelectedPeriod('Total');
    };

    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };
    
    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous);
    };

    const calculateAchievement = (current: number, target: number) => {
        if (target === 0) return current > 0 ? Infinity : 0;
        return (current / target);
    };

    const baseFilteredData = useMemo(() => {
        return data.filter(item => {
            if (selectedFlag && item.FLAG !== selectedFlag) return false;
            if (selectedValidity && item.VALIDITY !== selectedValidity) return false;
            if (selectedPaket && item.PAKET !== selectedPaket) return false;

            // Date filter
            const itemDate = new Date(item.PLAN_DATE);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start && itemDate < start) return false;
            if (end) {
                end.setHours(23, 59, 59, 999);
                if(itemDate > end) return false;
            }

            return true;
        });
    }, [data, selectedFlag, selectedValidity, selectedPaket, startDate, endDate]);

    const summaryData = useMemo<SummaryRow[]>(() => {
        if (!baseFilteredData || baseFilteredData.length === 0) return [];

        const getPeriodData = (productData: SalesPlanProductData): SalesPlanPeriodData => {
            return productData[selectedPeriod as keyof Omit<SalesPlanProductData, 'Total'>] || productData.Total;
        };

        const createSummaryMetric = (outlets: SalesPlanVoucherData[], productSelector: (d: SalesPlanVoucherData) => SalesPlanProductData, isQty: boolean): SummaryMetric => {
            const target = outlets.reduce((sum, o) => sum + getPeriodData(productSelector(o)).FM1, 0);
            const m_minus_1 = outlets.reduce((sum, o) => sum + getPeriodData(productSelector(o)).M1, 0);
            const m = outlets.reduce((sum, o) => sum + getPeriodData(productSelector(o)).M, 0);
            
            let oaTarget = 0, oa_m_minus_1 = 0, oa_m = 0;
            if (!isQty) {
                oaTarget = outlets.filter(o => getPeriodData(productSelector(o)).FM1 > 0).length;
                oa_m_minus_1 = outlets.filter(o => getPeriodData(productSelector(o)).M1 > 0).length;
                oa_m = outlets.filter(o => getPeriodData(productSelector(o)).M > 0).length;
            }

            return {
                target: isQty ? target : oaTarget,
                m_minus_1: isQty ? m_minus_1 : oa_m_minus_1,
                m: isQty ? m : oa_m,
                achv: calculateAchievement(isQty ? m : oa_m, isQty ? target : oaTarget),
                mom: calculateGrowth(isQty ? m : oa_m, isQty ? m_minus_1 : oa_m_minus_1),
            };
        };

        // FIX: Explicitly cast the initial value of reduce to ensure TypeScript correctly infers the accumulator type.
        const groupedByTap = baseFilteredData.reduce((acc, outlet) => {
            const tap = outlet.TAP || 'Unknown';
            if (!(acc as any)[tap]) (acc as any)[tap] = [];
            (acc as any)[tap].push(outlet);
            return acc;
        }, {} as Record<string, SalesPlanVoucherData[]>);

        const processedList: SummaryRow[] = [];
        const sortedTaps = Object.keys(groupedByTap).sort();

        for (const tap of sortedTaps) {
            const outletsInTap = groupedByTap[tap];
            
            // FIX: Explicitly cast the initial value of reduce to prevent 'outlets' from being 'unknown'.
            const groupedBySf = outletsInTap.reduce((acc, outlet) => {
                const sf = outlet.SALESFORCE || 'Unknown';
                if (!(acc as any)[sf]) (acc as any)[sf] = [];
                (acc as any)[sf].push(outlet);
                return acc;
            }, {} as Record<string, SalesPlanVoucherData[]>);

            const sfRows: SummaryRow[] = Object.entries(groupedBySf).map(([sfName, outlets]) => {
                const pjp = new Set(outlets.map(o => o.ID_DIGIPOS)).size; // Unique outlets
                return {
                    type: 'sf' as const,
                    key: `${tap}-${sfName}`,
                    salesforce: sfName,
                    tap,
                    pjp,
                    oaSimpati: createSummaryMetric(outlets, d => d.Simpati, false),
                    qtySimpati: createSummaryMetric(outlets, d => d.Simpati, true),
                    oaByu: createSummaryMetric(outlets, d => d.byU, false),
                    qtyByu: createSummaryMetric(outlets, d => d.byU, true),
                    oaTotal: createSummaryMetric(outlets, d => d.TotalVoucher, false),
                    qtyTotal: createSummaryMetric(outlets, d => d.TotalVoucher, true),
                };
            }).sort((a,b) => a.salesforce.localeCompare(b.salesforce));

            processedList.push(...sfRows);

            // Calculate Tap Total
            const tapPjp = new Set(outletsInTap.map(o => o.ID_DIGIPOS)).size;
            processedList.push({
                type: 'tap_total',
                key: `${tap}-total`,
                salesforce: `TOTAL ${tap.toUpperCase()}`,
                tap: '',
                pjp: tapPjp,
                oaSimpati: createSummaryMetric(outletsInTap, d => d.Simpati, false),
                qtySimpati: createSummaryMetric(outletsInTap, d => d.Simpati, true),
                oaByu: createSummaryMetric(outletsInTap, d => d.byU, false),
                qtyByu: createSummaryMetric(outletsInTap, d => d.byU, true),
                oaTotal: createSummaryMetric(outletsInTap, d => d.TotalVoucher, false),
                qtyTotal: createSummaryMetric(outletsInTap, d => d.TotalVoucher, true),
            });
        }

        // Calculate Grand Total
        const grandPjp = new Set(baseFilteredData.map(o => o.ID_DIGIPOS)).size;
        processedList.push({
            type: 'grand_total',
            key: 'grand-total',
            salesforce: 'TOTAL CLUSTER',
            tap: '',
            pjp: grandPjp,
            oaSimpati: createSummaryMetric(baseFilteredData, d => d.Simpati, false),
            qtySimpati: createSummaryMetric(baseFilteredData, d => d.Simpati, true),
            oaByu: createSummaryMetric(baseFilteredData, d => d.byU, false),
            qtyByu: createSummaryMetric(baseFilteredData, d => d.byU, true),
            oaTotal: createSummaryMetric(baseFilteredData, d => d.TotalVoucher, false),
            qtyTotal: createSummaryMetric(baseFilteredData, d => d.TotalVoucher, true),
        });

        return processedList;
    }, [baseFilteredData, selectedPeriod]);

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
    
    const handleToggleAll = () => {
        const newState = !isAllExpanded;
        const newExpandedState: Record<string, boolean> = {};
        allTapNames.forEach(tapName => {
            newExpandedState[tapName] = newState;
        });
        setExpandedTaps(newExpandedState);
    };

    type ProcessedData = SalesPlanVoucherData & {
        simpatiTarget: number;
        simpatiM1: number;
        simpatiM: number;
        simpatiAchv: number;
        simpatiMom: number;
        byuTarget: number;
        byuM1: number;
        byuM: number;
        byuAchv: number;
        byuMom: number;
        totalTarget: number;
        totalM1: number;
        totalM: number;
        totalAchv: number;
        totalMom: number;
    };

    const processedData = useMemo((): ProcessedData[] => {
        const getPeriodData = (productData: SalesPlanProductData): SalesPlanPeriodData => {
            return productData[selectedPeriod as keyof Omit<SalesPlanProductData, 'Total'>] || productData.Total;
        };
        
        return baseFilteredData.map(item => {
            const simpatiData = getPeriodData(item.Simpati);
            const byuData = getPeriodData(item.byU);
            const totalData = getPeriodData(item.TotalVoucher);

            return {
                ...item,
                simpatiTarget: simpatiData.FM1,
                simpatiM1: simpatiData.M1,
                simpatiM: simpatiData.M,
                simpatiAchv: calculateAchievement(simpatiData.M, simpatiData.FM1) * 100,
                simpatiMom: calculateGrowth(simpatiData.M, simpatiData.M1) * 100,
                byuTarget: byuData.FM1,
                byuM1: byuData.M1,
                byuM: byuData.M,
                byuAchv: calculateAchievement(byuData.M, byuData.FM1) * 100,
                byuMom: calculateGrowth(byuData.M, byuData.M1) * 100,
                totalTarget: totalData.FM1,
                totalM1: totalData.M1,
                totalM: totalData.M,
                totalAchv: calculateAchievement(totalData.M, totalData.FM1) * 100,
                totalMom: calculateGrowth(totalData.M, totalData.M1) * 100,
            };
        });
    }, [baseFilteredData, selectedPeriod]);

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
        
        { accessorKey: 'simpatiTarget', header: 'Target', group: 'Simpati', align: 'right', cell: (row) => row.simpatiTarget.toLocaleString(), enableSorting: true },
        { accessorKey: 'simpatiM1', header: 'M-1', group: 'Simpati', align: 'right', cell: (row) => row.simpatiM1.toLocaleString(), enableSorting: true },
        { accessorKey: 'simpatiM', header: 'M', group: 'Simpati', align: 'right', cell: (row) => row.simpatiM.toLocaleString(), enableSorting: true },
        { accessorKey: 'simpatiAchv', header: 'Achv', group: 'Simpati', align: 'right', cell: (row) => <AchvCell value={row.simpatiAchv} />, enableSorting: true },
        { accessorKey: 'simpatiMom', header: 'MoM', group: 'Simpati', align: 'right', cell: (row) => <GrowthCell value={row.simpatiMom} />, enableSorting: true },
        
        { accessorKey: 'byuTarget', header: 'Target', group: 'byU', align: 'right', cell: (row) => row.byuTarget.toLocaleString(), enableSorting: true },
        { accessorKey: 'byuM1', header: 'M-1', group: 'byU', align: 'right', cell: (row) => row.byuM1.toLocaleString(), enableSorting: true },
        { accessorKey: 'byuM', header: 'M', group: 'byU', align: 'right', cell: (row) => row.byuM.toLocaleString(), enableSorting: true },
        { accessorKey: 'byuAchv', header: 'Achv', group: 'byU', align: 'right', cell: (row) => <AchvCell value={row.byuAchv} />, enableSorting: true },
        { accessorKey: 'byuMom', header: 'MoM', group: 'byU', align: 'right', cell: (row) => <GrowthCell value={row.byuMom} />, enableSorting: true },
        
        { accessorKey: 'totalTarget', header: 'Target', group: 'Total Voucher', align: 'right', cell: (row) => row.totalTarget.toLocaleString(), enableSorting: true },
        { accessorKey: 'totalM1', header: 'M-1', group: 'Total Voucher', align: 'right', cell: (row) => row.totalM1.toLocaleString(), enableSorting: true },
        { accessorKey: 'totalM', header: 'M', group: 'Total Voucher', align: 'right', cell: (row) => row.totalM.toLocaleString(), enableSorting: true },
        { accessorKey: 'totalAchv', header: 'Achv', group: 'Total Voucher', align: 'right', cell: (row) => <AchvCell value={row.totalAchv} />, enableSorting: true },
        { accessorKey: 'totalMom', header: 'MoM', group: 'Total Voucher', align: 'right', cell: (row) => <GrowthCell value={row.totalMom} />, enableSorting: true },
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
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);
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
            'ID Digipos': row.ID_DIGIPOS,
            'No RS': row.NO_RS,
            'Nama Outlet': row.NAMA_OUTLET,
            'Salesforce': row.SALESFORCE,
            'TAP': row.TAP,
            'Kabupaten': row.KABUPATEN,
            'Kecamatan': row.KECAMATAN,
            'Flag': row.FLAG,
            'Simpati Target': row.simpatiTarget,
            'Simpati M-1': row.simpatiM1,
            'Simpati M': row.simpatiM,
            'Simpati Achv (%)': row.simpatiAchv.toFixed(1),
            'Simpati MoM (%)': row.simpatiMom.toFixed(1),
            'byU Target': row.byuTarget,
            'byU M-1': row.byuM1,
            'byU M': row.byuM,
            'byU Achv (%)': row.byuAchv.toFixed(1),
            'byU MoM (%)': row.byuMom.toFixed(1),
            'Total Target': row.totalTarget,
            'Total M-1': row.totalM1,
            'Total M': row.totalM,
            'Total Achv (%)': row.totalAchv.toFixed(1),
            'Total MoM (%)': row.totalMom.toFixed(1),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Sales Plan Voucher");
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `detail_sales_plan_voucher_${date}.xlsx`);
    };

    if (isLoading) return <LoadingIndicator type="table" tableColumns={7} text="Memuat data sales plan..." />;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    const renderSummaryMetric = (metric: SummaryMetric) => (
        <>
            <td className="px-2 py-1.5">{metric.target.toLocaleString()}</td>
            <td className="px-2 py-1.5">{metric.m_minus_1.toLocaleString()}</td>
            <td className="px-2 py-1.5">{metric.m.toLocaleString()}</td>
            <td className="px-2 py-1.5"><AchvCell value={metric.achv * 100} /></td>
            <td className="px-2 py-1.5"><GrowthCell value={metric.mom * 100} /></td>
        </>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Sales Plan Voucher Fisik</h1>
                {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                        Data diperbarui pada: {lastUpdated.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>

            <div className="p-4 bg-white rounded-lg flex flex-wrap items-center gap-x-4 gap-y-2">
                <h3 className="text-md font-semibold text-gray-700">Filter</h3>
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm font-medium">Dari:</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40 p-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm font-medium">Sampai:</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40 p-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500" />
                </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="paket-filter" className="text-sm font-medium">Paket:</label>
                    <select id="paket-filter" value={selectedPaket} onChange={e => setSelectedPaket(e.target.value)} className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm p-2 w-40">
                        <option value="">All</option>
                        {uniquePakets.sort().map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="validity-filter" className="text-sm font-medium">Validity:</label>
                    <select id="validity-filter" value={selectedValidity} onChange={e => setSelectedValidity(e.target.value)} className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm p-2 w-32">
                        <option value="">All</option>
                        {uniqueValidities.sort().map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="flag-filter" className="text-sm font-medium">Flag:</label>
                    <select id="flag-filter" value={selectedFlag} onChange={e => setSelectedFlag(e.target.value)} className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm p-2 w-32">
                        <option value="">All</option>
                        {uniqueFlags.sort().map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="period-filter" className="text-sm font-medium">Periode:</label>
                    <select id="period-filter" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm p-2 w-28">
                        <option value="Total">Total</option>
                        <option value="W1">W1</option>
                        <option value="W2">W2</option>
                        <option value="W3">W3</option>
                        <option value="W4">W4</option>
                        <option value="W5">W5</option>
                    </select>
                </div>
                <button onClick={handleClearFilters} className="px-4 py-2.5 text-sm font-medium text-red-700 bg-white border border-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
                    Clear Filter
                </button>
            </div>

             <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Summary Sales Plan</h2>
                 <div className="mb-3">
                    <button onClick={handleToggleAll} className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        {isAllExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-xs whitespace-nowrap">
                        <thead className="text-white align-middle text-center uppercase">
                            <tr>
                                <th rowSpan={3} className="px-2 py-2 bg-red-800 border-r border-red-700 sticky left-0 z-20">Salesforce</th>
                                <th rowSpan={3} className="px-2 py-2 bg-red-800 border-r border-red-700">TAP</th>
                                <th rowSpan={3} className="px-2 py-2 bg-red-800 border-r border-red-700">PJP</th>
                                <th colSpan={10} className="px-2 py-2 bg-red-800 border-r border-red-700">Simpati</th>
                                <th colSpan={10} className="px-2 py-2 bg-purple-800 border-r border-purple-700">byU</th>
                                <th colSpan={10} className="px-2 py-2 bg-gray-600 border-r border-gray-700">Total</th>
                            </tr>
                            <tr className="bg-red-700">
                                <th colSpan={5} className="px-2 py-1 border-r border-red-600">OA</th>
                                <th colSpan={5} className="px-2 py-1 border-r border-red-600">QTY</th>
                                <th colSpan={5} className="px-2 py-1 bg-purple-700 border-r border-purple-600">OA</th>
                                <th colSpan={5} className="px-2 py-1 bg-purple-700 border-r border-purple-600">QTY</th>
                                <th colSpan={5} className="px-2 py-1 bg-gray-500 border-r border-gray-600">OA</th>
                                <th colSpan={5} className="px-2 py-1 bg-gray-500 border-r border-gray-600">QTY</th>
                            </tr>
                            <tr className="bg-red-600">
                                {['Target', 'M-1', 'M', 'Achv', 'MoM'].map(h => <th key={`sim-oa-${h}`} className="px-2 py-2 font-normal border-r bg-red-600 border-red-500">{h}</th>)}
                                {['Target', 'M-1', 'M', 'Achv', 'MoM'].map(h => <th key={`sim-qty-${h}`} className="px-2 py-2 font-normal border-r bg-red-600 border-red-500">{h}</th>)}
                                {['Target', 'M-1', 'M', 'Achv', 'MoM'].map(h => <th key={`byu-oa-${h}`} className="px-2 py-2 font-normal border-r bg-purple-600 border-purple-500">{h}</th>)}
                                {['Target', 'M-1', 'M', 'Achv', 'MoM'].map(h => <th key={`byu-qty-${h}`} className="px-2 py-2 font-normal border-r bg-purple-600 border-purple-500">{h}</th>)}
                                {['Target', 'M-1', 'M', 'Achv', 'MoM'].map(h => <th key={`total-oa-${h}`} className="px-2 py-2 font-normal border-r bg-gray-500 border-gray-400">{h}</th>)}
                                {['Target', 'M-1', 'M', 'Achv', 'MoM'].map(h => <th key={`total-qty-${h}`} className="px-2 py-2 font-normal border-r bg-gray-500 border-gray-400">{h}</th>)}
                            </tr>
                        </thead>
                         <tbody>
                            {summaryData.filter(r => r.type !== 'grand_total').map(row => {
                                let rowClass = 'border-b text-gray-800 text-sm text-center';
                                if (row.type === 'tap_total') rowClass += ' font-bold bg-slate-100 text-slate-900';
                                if (row.type === 'sf' && !expandedTaps[row.tap.toUpperCase()]) return null;

                                return (
                                <tr key={row.key} className={rowClass}>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-left font-medium bg-white sticky left-0 z-10">
                                        <div className="flex items-center gap-2">
                                        {row.type === 'tap_total' && (
                                            <button onClick={() => toggleTap(row.salesforce.replace('TOTAL ', ''))} className="p-0.5 rounded-full hover:bg-slate-300">
                                            {expandedTaps[row.salesforce.replace('TOTAL ', '')] ? <MinusCircleIcon className="w-4 h-4 text-slate-800" /> : <PlusCircleIcon className="w-4 h-4 text-slate-800" />}
                                            </button>
                                        )}
                                        {row.salesforce}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-left">{row.tap}</td>
                                    <td className="px-2 py-1.5">{row.pjp.toLocaleString()}</td>
                                    {renderSummaryMetric(row.oaSimpati)}
                                    {renderSummaryMetric(row.qtySimpati)}
                                    {renderSummaryMetric(row.oaByu)}
                                    {renderSummaryMetric(row.qtyByu)}
                                    {renderSummaryMetric(row.oaTotal)}
                                    {renderSummaryMetric(row.qtyTotal)}
                                </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            {summaryData.filter(r => r.type === 'grand_total').map(row => (
                                <tr key={row.key} className="font-extrabold bg-red-800 text-white text-sm text-center">
                                    <td className="px-2 py-2 whitespace-nowrap text-left sticky left-0 z-10 bg-red-800">{row.salesforce}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-left">{row.tap}</td>
                                    <td className="px-2 py-2">{row.pjp.toLocaleString()}</td>
                                    {renderSummaryMetric(row.oaSimpati)}
                                    {renderSummaryMetric(row.qtySimpati)}
                                    {renderSummaryMetric(row.oaByu)}
                                    {renderSummaryMetric(row.qtyByu)}
                                    {renderSummaryMetric(row.oaTotal)}
                                    {renderSummaryMetric(row.qtyTotal)}
                                </tr>
                            ))}
                        </tfoot>
                    </table>
                </div>
            </div>

            <CollapsibleSection title="Detail Sales Plan Voucher Fisik">
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

export default SalesPlanVoucherPage;
