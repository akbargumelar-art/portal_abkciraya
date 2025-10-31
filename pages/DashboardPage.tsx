
import React from 'react';
import { ArrowTrendingUpIcon, UserGroupIcon, CurrencyDollarIcon, PhoneArrowDownLeftIcon } from '../components/icons';

const BarChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
        <h3 className="text-md font-semibold text-gray-700 mb-4">Distribusi Outlet per PJP</h3>
        <div className="flex items-end h-64 space-x-4">
            <div className="flex flex-col items-center h-full w-full justify-end">
                 <div className="w-1/2 bg-red-600 rounded-t-md" style={{ height: '100%' }}></div>
                 <p className="text-xs text-gray-500 mt-2">PJP</p>
            </div>
             <div className="flex flex-col justify-between h-full text-xs text-gray-400">
                <span>36</span>
                <span>27</span>
                <span>18</span>
                <span>9</span>
                <span>0</span>
            </div>
        </div>
    </div>
);

const LineChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
        <h3 className="text-md font-semibold text-gray-700 mb-4">Tren Penjualan 6 Bulan Terakhir</h3>
        <div className="h-64 relative">
             <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400">
                <div className="border-t border-dashed w-full"></div>
                <div className="border-t border-dashed w-full"></div>
                <div className="border-t border-dashed w-full"></div>
                <div className="border-t border-dashed w-full"></div>
            </div>
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <path d="M 0 120 C 50 100, 100 110, 150 100 S 250 80, 300 90 S 400 70, 450 80 L 500 80" fill="none" stroke="#F13B4B" strokeWidth="2"/>
                <circle cx="25" cy="115" r="4" fill="white" stroke="#F13B4B" strokeWidth="2" />
                <circle cx="125" cy="105" r="4" fill="white" stroke="#F13B4B" strokeWidth="2" />
                <circle cx="225" cy="85" r="4" fill="white" stroke="#F13B4B" strokeWidth="2" />
                <circle cx="325" cy="85" r="4" fill="white" stroke="#F13B4B" strokeWidth="2" />
                <circle cx="425" cy="75" r="4" fill="white" stroke="#F13B4B" strokeWidth="2" />
                 <circle cx="475" cy="80" r="4" fill="white" stroke="#F13B4B" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                <span>3000</span>
                <span>4500</span>
                <span>6000</span>
            </div>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-50">
                        <ArrowTrendingUpIcon className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Penjualan</p>
                        <p className="text-xl font-bold text-gray-800">Rp 1.200.000.000</p>
                    </div>
                </div>
                 <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100">
                        <UserGroupIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Outlet Aktif</p>
                        <p className="text-2xl font-bold text-gray-800">34</p>
                    </div>
                </div>
                 <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-100">
                        <CurrencyDollarIcon className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Digipos Transaksi</p>
                        <p className="text-2xl font-bold text-gray-800">4.890</p>
                    </div>
                </div>
                 <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-yellow-100">
                        <PhoneArrowDownLeftIcon className="w-7 h-7 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Sell Out Perdana</p>
                        <p className="text-2xl font-bold text-gray-800">12.345</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <BarChart />
                </div>
                <div className="lg:col-span-3">
                    <LineChart />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;