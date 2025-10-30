
import React, { useMemo, useState } from 'react';
import DataTable, { ColumnDef } from '../components/DataTable';
import { outletData } from '../data/outletData';
import { OutletData } from '../types';
import { EyeIcon } from '../components/icons';
import Modal from '../components/Modal';

const OutletRegisterPage: React.FC = () => {
    const [selectedOutlet, setSelectedOutlet] = useState<OutletData | null>(null);

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

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Outlet Maintenance</h1>
             <div className="bg-white rounded-lg shadow overflow-x-auto">
                <DataTable columns={columns} data={outletData} />
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
