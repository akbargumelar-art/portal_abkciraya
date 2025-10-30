
import React from 'react';

const InputFormPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Input Form</h1>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Data Collection Forms</h2>
                <p className="text-gray-700">This page will contain a collection of forms for various data input tasks, such as:</p>
                <ul className="list-disc list-inside mt-2 text-gray-600">
                    <li>Data POP Material</li>
                    <li>Data Owner (NIK/NPWP)</li>
                    <li>Pengajuan Konsinyasi Barang</li>
                    <li>Info Kompetitor</li>
                    <li>Data Branding Mitra Outlet</li>
                    <li>Pengajuan Layar Toko</li>
                    <li>Log Book Outlet</li>
                </ul>
            </div>
        </div>
    );
};

export default InputFormPage;
