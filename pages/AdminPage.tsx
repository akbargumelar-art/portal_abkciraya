
import React from 'react';
import { Link } from 'react-router-dom';

const AdminPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Panel</h1>
            <p className="text-lg text-gray-600 mb-6">Exclusive tools for Super Admins.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/admin/user-management" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow block">
                    <h2 className="text-xl font-semibold mb-2 text-red-700">User Management</h2>
                    <p className="text-gray-600">Create, edit, and manage user accounts and roles.</p>
                </Link>
                <Link to="/admin/data-upload" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow block">
                    <h2 className="text-xl font-semibold mb-2 text-red-700">Data Upload Center</h2>
                    <p className="text-gray-600">Download templates and upload new data files.</p>
                </Link>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <h2 className="text-xl font-semibold mb-2 text-red-700">Dynamic Form Builder</h2>
                    <p className="text-gray-600">Build and deploy custom forms for data collection without writing code.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <h2 className="text-xl font-semibold mb-2 text-red-700">Dashboard Builder</h2>
                    <p className="text-gray-600">Create custom, drag-and-drop dashboards and assign them to user roles.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;