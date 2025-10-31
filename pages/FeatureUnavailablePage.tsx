
import React from 'react';
import { Link } from 'react-router-dom';

const FeatureUnavailablePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <svg className="w-24 h-24 text-red-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-4.243-4.243l3.275-3.275a4.5 4.5 0 00-6.336 4.486c.061.58.278 1.128.63 1.623m-1.325 5.108l-3.03-2.496m0 0l-3.03 2.496m3.03-2.496v4.655m-4.655-4.655l-2.496-3.03m0 0l2.496 3.03m-2.496-3.03l4.655-5.653" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Segera Hadir</h1>
            <p className="text-lg text-gray-600 mb-6 max-w-md">
                Fitur ini sedang dalam pengembangan aktif oleh tim kami. Kami bekerja keras untuk menghadirkannya untuk Anda sesegera mungkin.
            </p>
            <Link 
                to="/dashboard" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Kembali ke Dashboard
            </Link>
        </div>
    );
};

export default FeatureUnavailablePage;
