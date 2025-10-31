
import React, { useMemo, useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '../components/DataTable';
import { getOutlets } from '../services/api';
import { OutletData } from '../types';
import { EyeIcon } from '../components/icons';
import Modal from '../components/Modal';

const OutletRegisterPage: React.FC = () => {
    const [data, setData] = useState<OutletData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<OutletData | null>(null);

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
            }
        };

        fetchData();
    }, []);

    const handleViewDetails = (outlet: OutletData) => {
      setSelectedOutlet(outlet);
    };

    const columns = useMemo<ColumnDef<OutletData>[]>(() => [
        {
            accessorKey: 'OUTLET_ID',
            header: 'ID Outlet',
            enableSorting: true,
            enableFiltering: true,
        },
        {
            accessorKey: 'NO_RS',
            header: 'No RS',
            enableSorting: true,
            enableFiltering: true,
        },
        {
            accessorKey: 'NAMA_OUTLET',
            header: 'Nama Outlet',
            enableSorting: true,
            enableFiltering: true,
        },
        {
            accessorKey: 'KABUPATEN',
            header: 'Kabupaten',
            enableSorting: true,
            enableFiltering: true,
        },
        {
            accessorKey: 'KECAMATAN',
            header: 'Kecamatan',
            enableSorting: true,
            enableFiltering: true,
        },
        {
            accessorKey: 'SF_CODE',
            header: 'SF Code',
            enableSorting: true,
            enableFiltering: true,
        },
        {
            accessorKey: 'FISIK',
            header: 'Fisik',
            enableSorting: true,
            enableFiltering: true,
            filterType: 'select',
        },
        {
            accessorKey: 'PJP',
            header: 'PJP',
            enableSorting: true,
            enableFiltering: true,
            filterType: 'select',
        },
        {
            accessorKey: 'FLAG',
            header: 'Flag',
            enableSorting: true,
            enableFiltering: true,
            filterType: 'select',
        },
        {
            id: 'aksi',
            accessorKey: 'OUTLET_ID', 
            header: 'Aksi',
            cell: (row) => (
                <button 
                    onClick={() => handleViewDetails(row)}
                    className="text-gray-600 hover:text-red-600 focus:outline-none"
                    aria-label={`View details for ${row.NAMA_OUTLET}`}
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
            ),
        },
    ], []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center p-10">
                    <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-600">Loading data...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-10 text-center text-red-600">
                    <p>Error: {error}</p>
                    <p>Could not load outlet data. Please try again later.</p>
                </div>
            );
        }

        return <DataTable columns={columns} data={data} />;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Outlet Maintenance</h1>
             <div className="bg-white rounded-lg shadow overflow-x-auto">
                {renderContent()}
            </div>
            
            {selectedOutlet && (
                <Modal 
                    isOpen={!!selectedOutlet} 
                    onClose={() => setSelectedOutlet(null)}
                    title={`Detail for ${selectedOutlet.NAMA_OUTLET}`}
                >
                    <div className="space-y-2 text-sm">
                       {Object.entries(selectedOutlet).map(([key, value]) => (
                         <div key={key} className="grid grid-cols-3 gap-2 border-b pb-1">
                           <span className="font-semibold text-gray-600 col-span-1 capitalize">{key.replace(/_/g, ' ').toLowerCase()}</span>
                           <span className="text-gray-800 col-span-2">{value || '-'}</span>
                         </div>
                       ))}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default OutletRegisterPage;
