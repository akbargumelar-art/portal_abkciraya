import React, { useMemo, useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '../components/DataTable';
import { getOutlets } from '../services/api';
import { OutletData } from '../types';
import { EyeIcon, PlusCircleIcon, MinusCircleIcon } from '../components/icons';
import Modal from '../components/Modal';
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
    outletRegister: number;
    fisik: number;
    nonFisik: number;
    pjp: number;
    ratioPjpToRegister: number;
    ratioPjpToFisik: number;
}


type SummaryFilter = {
    type: 'sf' | 'tap';
    value: string;
} | null;


const OutletRegisterPage: React.FC = () => {
    const [data, setData] = useState<OutletData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<OutletData | null>(null);
    const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof OutletData; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [expandedTaps, setExpandedTaps] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const outletData = await getOutlets();
                setData(outletData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setIsLoading(false);
                setLastUpdated(new Date());
            }
        };

        fetchData();
    }, []);
    
    const summaryData = useMemo<SummaryRow[]>(() => {
        if (!data || data.length === 0) return [];
        
        const groupedByTap: Record<string, OutletData[]> = data.reduce((acc, outlet) => {
            const tap = outlet.TAP || 'Unknown';
            if (!acc[tap]) acc[tap] = [];
            acc[tap].push(outlet);
            return acc;
        }, {});

        const processedList: SummaryRow[] = [];
        const sortedTaps = Object.keys(groupedByTap).sort();

        for (const tap of sortedTaps) {
            const outletsInTap = groupedByTap[tap];
            const summaryBySF: Record<string, Omit<SummaryRow, 'type' | 'key' | 'salesforce' | 'tap'>> = {};

            outletsInTap.forEach(outlet => {
                const sfName = outlet.NAMA_SALESFORCE;
                if (!summaryBySF[sfName]) {
                    summaryBySF[sfName] = { outletRegister: 0, fisik: 0, nonFisik: 0, pjp: 0, ratioPjpToRegister: 0, ratioPjpToFisik: 0 };
                }
                const summary = summaryBySF[sfName];
                summary.outletRegister++;
                if(outlet.FISIK === 'FISIK') summary.fisik++;
                if(outlet.PJP === 'PJP') summary.pjp++;
            });
            
            const sfRows: SummaryRow[] = Object.entries(summaryBySF).map(([sfName, summary]): SummaryRow => {
                summary.nonFisik = summary.outletRegister - summary.fisik;
                summary.ratioPjpToRegister = summary.outletRegister > 0 ? (summary.pjp / summary.outletRegister) : 0;
                summary.ratioPjpToFisik = summary.fisik > 0 ? (summary.pjp / summary.fisik) : 0;
                return { type: 'sf', key: sfName, salesforce: sfName, tap: tap, ...summary };
            }).sort((a, b) => a.salesforce.localeCompare(b.salesforce));

            processedList.push(...sfRows);

            const tapTotal = sfRows.reduce((acc, curr) => {
                acc.outletRegister += curr.outletRegister;
                acc.fisik += curr.fisik;
                acc.pjp += curr.pjp;
                return acc;
            }, { outletRegister: 0, fisik: 0, pjp: 0, nonFisik: 0, ratioPjpToRegister: 0, ratioPjpToFisik: 0 });

            tapTotal.nonFisik = tapTotal.outletRegister - tapTotal.fisik;
            tapTotal.ratioPjpToRegister = tapTotal.outletRegister > 0 ? (tapTotal.pjp / tapTotal.outletRegister) : 0;
            tapTotal.ratioPjpToFisik = tapTotal.fisik > 0 ? (tapTotal.pjp / tapTotal.fisik) : 0;

            processedList.push({ type: 'tap_total', key: `${tap}-total`, salesforce: `TOTAL ${tap.toUpperCase()}`, tap: '', ...tapTotal });
        }

        const grandTotal = processedList.filter(row => row.type === 'sf').reduce((acc, curr) => {
            acc.outletRegister += curr.outletRegister;
            acc.fisik += curr.fisik;
            acc.pjp += curr.pjp;
            return acc;
        }, { outletRegister: 0, fisik: 0, pjp: 0, nonFisik: 0, ratioPjpToRegister: 0, ratioPjpToFisik: 0 });

        grandTotal.nonFisik = grandTotal.outletRegister - grandTotal.fisik;
        grandTotal.ratioPjpToRegister = grandTotal.outletRegister > 0 ? (grandTotal.pjp / grandTotal.outletRegister) : 0;
        grandTotal.ratioPjpToFisik = grandTotal.fisik > 0 ? (grandTotal.pjp / grandTotal.fisik) : 0;
        
        processedList.push({ type: 'grand_total', key: 'grand-total', salesforce: 'TOTAL CLUSTER', tap: '', ...grandTotal });

        return processedList;
    }, [data]);
    
    const allTapNames = useMemo(() => 
        summaryData
            .filter(row => row.type === 'tap_total')
            .map(row => row.salesforce.replace('TOTAL ', '')),
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
        setExpandedTaps(prev => ({ ...prev, [tapName]: !prev[tapName] }));
    };

    const handleViewDetails = (outlet: OutletData) => {
      setSelectedOutlet(outlet);
    };

    const columns = useMemo<ColumnDef<OutletData>[]>(() => [
        { accessorKey: 'OUTLET_ID', header: 'ID Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NO_RS', header: 'No RS', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'NAMA_OUTLET', header: 'Nama Outlet', enableSorting: true, enableFiltering: true, align: 'left' },
        { accessorKey: 'KABUPATEN', header: 'Kabupaten', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'KECAMATAN', header: 'Kecamatan', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'NAMA_SALESFORCE', header: 'Nama Salesforce', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'TAP', header: 'TAP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'SF_CODE', header: 'SF Code', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'FISIK', header: 'Fisik', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'PJP', header: 'PJP', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { accessorKey: 'FLAG', header: 'Flag', enableSorting: true, enableFiltering: true, filterType: 'select', align: 'left' },
        { id: 'aksi', accessorKey: 'OUTLET_ID', header: 'Aksi', align: 'center', cell: (row) => (<button onClick={() => handleViewDetails(row)} className="text-gray-600 hover:text-red-600 focus:outline-none" aria-label={`View details for ${row.NAMA_OUTLET}`}><EyeIcon className="w-5 h-5" /></button>),},
    ], []);

    const filteredBySummaryData = useMemo(() => {
        if (!summaryFilter) return data;
        if (summaryFilter.type === 'sf') return data.filter(item => item.NAMA_SALESFORCE === summaryFilter.value);
        if (summaryFilter.type === 'tap') return data.filter(item => item.TAP === summaryFilter.value);
        return data;
    }, [data, summaryFilter]);

    const uniqueOptions = useMemo(() => {
        const options: Record<string, Set<string>> = {};
        columns.forEach(col => {
            if (col.filterType === 'select') {
                options[col.accessorKey as string] = new Set(filteredBySummaryData.map(item => String(item[col.accessorKey as keyof OutletData])));
            }
        });
        return options;
    }, [filteredBySummaryData, columns]);

    const filteredByColumnsData = useMemo(() => {
        return filteredBySummaryData.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const itemValue = String(item[key as keyof OutletData] ?? '').toLowerCase();
                const filterValue = String(value).toLowerCase();
                const colDef = columns.find(c => c.accessorKey === key);
                if (colDef?.filterType === 'select') return itemValue === filterValue;
                return itemValue.includes(filterValue);
            });
        });
    }, [filteredBySummaryData, filters, columns]);
    
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredByColumnsData;
        return [...filteredByColumnsData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredByColumnsData, sortConfig]);

    const handleSummaryFilterClick = (type: 'sf' | 'tap', value: string) => {
        setSummaryFilter(current => {
            if (current && current.type === type && current.value === value) return null;
            return { type, value };
        });
        setFilters({});
    };

    const handleSort = (key: keyof OutletData) => {
        setSortConfig(current => ({ key, direction: current && current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleFilterChange = (key: keyof OutletData, value: string) => {
        setFilters(prev => ({ ...prev, [key as string]: value }));
    };

    const handleExport = () => {
        const dataToExport = sortedData.map(row => ({
            'Tanggal Dibuat': row.CREATE_AT, 'ID Outlet': row.OUTLET_ID, 'Nama Outlet': row.NAMA_OUTLET, 'Kelurahan': row.KELURAHAN, 'Kecamatan': row.KECAMATAN, 'Kabupaten': row.KABUPATEN, 'Cluster': row.CLUSTER, 'Branch': row.BRANCH, 'Regional': row.REGIONAL, 'Area': row.AREA, 'Longitude': row.LONGITUDE, 'Latitude': row.LATTITUDE, 'No RS': row.NO_RS, 'No Konfirmasi': row.NO_KONFIRMASI, 'Kategori': row.KATEGORI, 'Tipe Outlet': row.TIPE_OUTLET, 'Fisik': row.FISIK, 'Tipe Lokasi': row.TIPE_LOKASI, 'Klasifikasi': row.KLASIFIKASI, 'Jadwal Kunjungan': row.JADWAL_KUNJUNGAN, 'Terakhir Dikunjungi': row.TERAKHIR_DIKUNJUNGI, 'SF Code': row.SF_CODE, 'Nama Salesforce': row.NAMA_SALESFORCE, 'PJP': row.PJP, 'Flag': row.FLAG, 'TAP': row.TAP
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Outlet Data");
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `detail_outlet_data_export_${date}.xlsx`);
    };

    const getRatioColor = (ratio: number) => {
        if (ratio >= 0.8) return 'text-green-600';
        if (ratio >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderSummaryTable = () => {
        if (isLoading || summaryData.length === 0) return null;

        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Summary per Sales Force</h2>
                 <div className="mb-3">
                    <button onClick={handleToggleAll} className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        {isAllExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-600">
                        <thead className="text-xs text-white uppercase">
                            <tr className="bg-red-700">
                                <th rowSpan={2} scope="col" className="px-2 py-2 align-middle text-center border-r border-red-800">Nama Salesforce</th>
                                <th rowSpan={2} scope="col" className="px-2 py-2 align-middle text-center border-r border-red-800">Nama TAP</th>
                                <th rowSpan={2} scope="col" className="px-2 py-2 align-middle text-center border-r border-red-800">Outlet Register</th>
                                <th colSpan={2} scope="col" className="px-2 py-2 text-center border-x border-red-800">Fisik</th>
                                <th rowSpan={2} scope="col" className="px-2 py-2 align-middle text-center border-r border-red-800">PJP</th>
                                <th rowSpan={2} scope="col" className="px-2 py-2 align-middle text-center whitespace-normal border-r border-red-800">Ratio PJP to Outlet Register</th>
                                <th rowSpan={2} scope="col" className="px-2 py-2 align-middle text-center whitespace-normal">Ratio PJP to Outlet Fisik</th>
                            </tr>
                            <tr className="bg-red-600">
                                <th scope="col" className="px-2 py-2 font-normal text-center border-x border-red-700">Fisik</th>
                                <th scope="col" className="px-2 py-2 font-normal text-center border-x border-red-700">Non Fisik</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {summaryData.filter(r => r.type !== 'grand_total').map(row => {
                               if (row.type === 'sf' && !expandedTaps[row.tap.toUpperCase()]) return null;

                                const isTapTotal = row.type === 'tap_total';
                                const tapNameForToggle = isTapTotal ? row.salesforce.replace('TOTAL ', '') : '';
                                const rowStyle = isTapTotal ? 'font-bold bg-slate-100 text-slate-900' : 'bg-white';

                                return (
                                    <tr key={row.key} className={rowStyle}>
                                        <td className="px-2 py-1.5 whitespace-nowrap text-left font-medium">
                                            <div className="flex items-center gap-2">
                                                {isTapTotal && (
                                                    <button onClick={() => toggleTap(tapNameForToggle)} className="p-0.5 rounded-full hover:bg-slate-300">
                                                        {expandedTaps[tapNameForToggle] ? <MinusCircleIcon className="w-4 h-4 text-slate-800" /> : <PlusCircleIcon className="w-4 h-4 text-slate-800" />}
                                                    </button>
                                                )}
                                                 <a href="#" onClick={(e) => { e.preventDefault(); handleSummaryFilterClick(isTapTotal ? 'tap' : 'sf', isTapTotal ? tapNameForToggle : row.salesforce); }} className="hover:underline text-black">{row.salesforce}</a>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 whitespace-nowrap text-left">{row.tap}</td>
                                        <td className="px-2 py-1.5 text-center">{row.outletRegister.toLocaleString()}</td>
                                        <td className="px-2 py-1.5 text-center">{row.fisik.toLocaleString()}</td>
                                        <td className="px-2 py-1.5 text-center">{row.nonFisik.toLocaleString()}</td>
                                        <td className="px-2 py-1.5 text-center">{row.pjp.toLocaleString()}</td>
                                        <td className={`px-2 py-1.5 text-center font-semibold ${getRatioColor(row.ratioPjpToRegister)}`}>{(row.ratioPjpToRegister * 100).toFixed(1)}%</td>
                                        <td className={`px-2 py-1.5 text-center font-semibold ${getRatioColor(row.ratioPjpToFisik)}`}>{(row.ratioPjpToFisik * 100).toFixed(1)}%</td>
                                    </tr>
                                );
                           })}
                        </tbody>
                        <tfoot>
                            {summaryData.filter(r => r.type === 'grand_total').map(row => (
                                <tr key={row.key} className="font-extrabold bg-gray-200 text-black uppercase">
                                    <td className="px-2 py-2 text-left">{row.salesforce}</td>
                                    <td className="px-2 py-2 text-left">{row.tap}</td>
                                    <td className="px-2 py-2 text-center">{row.outletRegister.toLocaleString()}</td>
                                    <td className="px-2 py-2 text-center">{row.fisik.toLocaleString()}</td>
                                    <td className="px-2 py-2 text-center">{row.nonFisik.toLocaleString()}</td>
                                    <td className="px-2 py-2 text-center">{row.pjp.toLocaleString()}</td>
                                    <td className={`px-2 py-2 text-center ${getRatioColor(row.ratioPjpToRegister)}`}>{(row.ratioPjpToRegister * 100).toFixed(1)}%</td>
                                    <td className={`px-2 py-2 text-center ${getRatioColor(row.ratioPjpToFisik)}`}>{(row.ratioPjpToFisik * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tfoot>
                    </table>
                </div>
            </div>
        )
    };
    
    if (isLoading) return <LoadingIndicator type="table" tableColumns={6} text="Memuat data outlet..." />;
    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Outlet Register</h1>
                {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                        Data diperbarui pada: {lastUpdated.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
                 {summaryFilter && (
                    <div className="mt-4 bg-yellow-100 text-yellow-800 text-sm p-3 rounded-lg flex justify-between items-center">
                        <span>Filter aktif: <strong>{summaryFilter.type.toUpperCase()}: {summaryFilter.value}</strong>. Hanya data yang relevan yang ditampilkan di tabel detail.</span>
                        <button onClick={() => setSummaryFilter(null)} className="font-bold text-yellow-900">&times;</button>
                    </div>
                )}
            </div>
            
            {renderSummaryTable()}

            <CollapsibleSection title="Detail Data Outlet">
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
                        onSort={handleSort as any}
                        onFilterChange={handleFilterChange as any}
                    />
                </div>
            </CollapsibleSection>

            {selectedOutlet && (
                <Modal isOpen={!!selectedOutlet} onClose={() => setSelectedOutlet(null)} title={`Detail Outlet: ${selectedOutlet.NAMA_OUTLET}`}>
                    <div className="space-y-4 text-sm">
                       {Object.entries(selectedOutlet).map(([key, value]) => (
                         <div key={key} className="grid grid-cols-3 gap-4 border-b pb-2">
                           <span className="font-semibold text-gray-600 col-span-1">{key.replace(/_/g, ' ')}</span>
                           <span className="text-gray-800 col-span-2">{String(value)}</span>
                         </div>
                       ))}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default OutletRegisterPage;
