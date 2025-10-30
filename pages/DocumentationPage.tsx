
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ExampleForm from './ExampleForm';
import { UserRole } from '../types';

const DocumentationPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'ids' | 'd2c'>(
        user?.role === UserRole.DirectSalesD2C ? 'd2c' : 'ids'
    );

    const isIDS = user?.role === UserRole.SalesforceIDS || user?.role === UserRole.SupervisorIDS;
    const isD2C = user?.role === UserRole.DirectSalesD2C || user?.role === UserRole.SupervisorD2C;

    const renderTabs = () => (
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {isIDS && (
                    <button
                        onClick={() => setActiveTab('ids')}
                        className={`${
                            activeTab === 'ids'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Salesforce (IDS) Visit
                    </button>
                )}
                {isD2C && (
                     <button
                        onClick={() => setActiveTab('d2c')}
                        className={`${
                            activeTab === 'd2c'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Direct Sales (D2C) Visit
                    </button>
                )}
            </nav>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Dokumentasi Kunjungan</h1>
            {(isIDS && isD2C) && renderTabs()}

            <div>
                {activeTab === 'ids' && isIDS && <ExampleForm formType="IDS" key="ids-form" />}
                {activeTab === 'd2c' && isD2C && <ExampleForm formType="D2C" key="d2c-form" />}
            </div>
        </div>
    );
};

export default DocumentationPage;
