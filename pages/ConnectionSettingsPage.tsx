
import React, { useState } from 'react';
import { testConnection, saveConnectionSettings } from '../services/api';
import { CheckCircleIcon, XCircleIcon } from '../components/icons';

const ConnectionSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState({
        host: 'agrabudi.com',
        port: '52306',
        username: 'akbar',
        password: '',
        dbname: 'abk_portalciraya',
    });
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
        status: 'idle',
        message: '',
    });
     const [saveResult, setSaveResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
        status: 'idle',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const getErrorMessage = (error: unknown): string => {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return 'Gagal terhubung ke server. Pastikan layanan backend sudah berjalan dan dapat diakses.';
        }
        if (error instanceof Error) {
            return error.message;
        }
        return 'Terjadi kesalahan yang tidak terduga.';
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult({ status: 'idle', message: '' });
        setSaveResult({ status: 'idle', message: '' }); // Clear save result
        try {
            // Fill password for mock API to succeed
            const testSettings = { ...settings, password: settings.password || 'password' };
            const result = await testConnection(testSettings);
            if (result.success) {
                setTestResult({ status: 'success', message: result.message });
            } else {
                setTestResult({ status: 'error', message: result.message });
            }
        } catch (error) {
            setTestResult({ status: 'error', message: getErrorMessage(error) });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveResult({ status: 'idle', message: '' });
        setTestResult({ status: 'idle', message: '' }); // Clear test result
        try {
            // Fill password for mock API to succeed
            const saveSettings = { ...settings, password: settings.password || 'password' };
            const result = await saveConnectionSettings(saveSettings);
            if (result.success) {
                setSaveResult({ status: 'success', message: result.message });
            } else {
                setSaveResult({ status: 'error', message: result.message });
            }
        } catch (error) {
            setSaveResult({ status: 'error', message: getErrorMessage(error) });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Pengaturan Koneksi Database</h1>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md max-w-2xl">
                <h2 className="text-xl font-semibold mb-2">Konfigurasi MySQL Server</h2>
                <p className="text-sm text-gray-600 mb-6">Masukkan detail di bawah ini untuk menghubungkan aplikasi ke database MySQL Anda. Semua data operasional akan diambil dari server ini.</p>
                
                <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div>
                        <label htmlFor="host" className="block text-sm font-medium text-gray-700">Host</label>
                        <input type="text" name="host" id="host" value={settings.host} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900" placeholder="e.g., agrabudi.com" />
                    </div>
                     <div>
                        <label htmlFor="port" className="block text-sm font-medium text-gray-700">Port</label>
                        <input type="text" name="port" id="port" value={settings.port} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900" placeholder="e.g., 3306" />
                    </div>
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" name="username" id="username" value={settings.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900" placeholder="e.g., akbar" />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" value={settings.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900" placeholder="••••••••" />
                    </div>
                     <div>
                        <label htmlFor="dbname" className="block text-sm font-medium text-gray-700">Nama Database</label>
                        <input type="text" name="dbname" id="dbname" value={settings.dbname} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900" placeholder="e.g., sales_data" />
                    </div>

                    {testResult.message && (
                        <div className={`flex items-start text-sm p-3 rounded-md ${testResult.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testResult.status === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" /> : <XCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
                            <span>{testResult.message}</span>
                        </div>
                    )}
                     {saveResult.message && (
                        <div className={`flex items-start text-sm p-3 rounded-md ${saveResult.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {saveResult.status === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" /> : <XCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
                            <span>{saveResult.message}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <button type="button" onClick={handleTestConnection} disabled={isTesting || isSaving} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                            {isTesting ? 'Menguji...' : 'Uji Koneksi'}
                        </button>
                         <button type="submit" disabled={isSaving || isTesting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400">
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConnectionSettingsPage;
