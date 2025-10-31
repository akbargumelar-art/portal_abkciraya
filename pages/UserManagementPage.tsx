import React, { useState, useEffect, useMemo } from 'react';
import DataTable, { ColumnDef } from '../components/DataTable';
import { User, UserFormData, UserRole, MenuItem } from '../types';
import * as api from '../services/api';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import { PencilIcon, TrashIcon } from '../components/icons';
import { MENU_ITEMS } from '../constants';

// Helper to flatten menu items into a list of features with paths
const flattenMenuItems = (items: MenuItem[]): { path: string; name: string; isChild: boolean }[] => {
    const flattened: { path: string; name: string; isChild: boolean }[] = [];

    const recurse = (menuItems: MenuItem[], isChild = false) => {
        for (const item of menuItems) {
            // Add parent menu item if it's a direct link
            if (item.path) {
                const existing = flattened.find(i => i.path === item.path);
                if (!existing) {
                  flattened.push({ path: item.path, name: item.name, isChild });
                }
            }
            // Recurse into children
            if (item.children) {
                recurse(item.children, true);
            }
        }
    };

    recurse(items);
    return flattened;
};


const RolePermissionTable: React.FC = () => {
    const allRoles = useMemo(() => Object.values(UserRole), []);
    const allFeatures = useMemo(() => flattenMenuItems(MENU_ITEMS), []);
    
    // Initialize permissions state based on constants.ts
    const [permissions, setPermissions] = useState<Record<UserRole, Set<string>>>(() => {
        const initialPermissions: Record<UserRole, Set<string>> = {} as any;
        allRoles.forEach(role => {
            initialPermissions[role] = new Set<string>();
        });
        
        const populatePermissions = (items: MenuItem[]) => {
            items.forEach(item => {
                if (item.path && item.requiredRoles) {
                    item.requiredRoles.forEach(role => {
                        if (initialPermissions[role]) {
                           initialPermissions[role].add(item.path!);
                        }
                    });
                }
                if (item.children) {
                    populatePermissions(item.children);
                }
            });
        };
        
        populatePermissions(MENU_ITEMS);
        // Ensure Admin Super has all permissions
        allFeatures.forEach(feature => initialPermissions[UserRole.AdminSuper].add(feature.path));

        return initialPermissions;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    const handlePermissionChange = (role: UserRole, path: string, checked: boolean) => {
        setPermissions(prev => {
            const newPermissions = { ...prev };
            const rolePermissions = new Set(newPermissions[role]);
            if (checked) {
                rolePermissions.add(path);
            } else {
                rolePermissions.delete(path);
            }
            return { ...newPermissions, [role]: rolePermissions };
        });
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        setSaveStatus('');
        console.log("Saving new permissions:", permissions);
        // Simulate API call to save permissions
        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus('Hak akses berhasil diperbarui!');
            setTimeout(() => setSaveStatus(''), 3000);
        }, 1000);
    };

    return (
        <div className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Hak Akses Role</h2>
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
             {saveStatus && <div className="mb-4 text-sm text-green-700 bg-green-100 p-3 rounded-md transition-opacity duration-300">{saveStatus}</div>}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-white uppercase bg-red-800 whitespace-nowrap">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-red-800 z-10 min-w-[250px]">Halaman / Fitur</th>
                            {allRoles.map(role => (
                                <th key={role} scope="col" className="px-6 py-3 text-center min-w-[150px]">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {allFeatures.map(feature => (
                             <tr key={feature.path} className="bg-white hover:bg-gray-50">
                                <td className={`px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 ${feature.isChild ? 'pl-10' : ''}`}>
                                    {feature.name}
                                </td>
                                {allRoles.map(role => (
                                    <td key={`${role}-${feature.path}`} className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50 disabled:bg-gray-200"
                                            checked={permissions[role]?.has(feature.path)}
                                            disabled={role === UserRole.AdminSuper}
                                            onChange={(e) => handlePermissionChange(role, feature.path, e.target.checked)}
                                            aria-label={`Access for ${role} to ${feature.name}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (formData: UserFormData) => {
        try {
            if (editingUser) {
                await api.updateUser(editingUser.id, formData);
            } else {
                await api.addUser(formData);
            }
            handleCloseModal();
            fetchUsers(); // Refresh data
        } catch (err) {
            alert('Failed to save user: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.deleteUser(userId);
                fetchUsers(); // Refresh data
            } catch (err) {
                alert('Failed to delete user: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
        }
    };

    const columns = useMemo<ColumnDef<User>[]>(() => [
        { accessorKey: 'name', header: 'Name', enableSorting: true, enableFiltering: true },
        { accessorKey: 'username', header: 'Username', enableSorting: true, enableFiltering: true },
        { accessorKey: 'role', header: 'Role', enableSorting: true, enableFiltering: true, filterType: 'select' },
        {
            id: 'actions',
            accessorKey: 'id',
            header: 'Actions',
            cell: (user) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleOpenEditModal(user)}
                        className="text-gray-600 hover:text-blue-600 p-1"
                        aria-label={`Edit ${user.name}`}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-gray-600 hover:text-red-600 p-1"
                        aria-label={`Delete ${user.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], []);

    const renderUserTable = () => {
        if (isLoading) {
            return <div className="text-center p-8">Loading users...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-600">{error}</div>;
        }
        return <DataTable columns={columns} data={users} />;
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen User</h1>
                    <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                    >
                        Tambah User Baru
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    {renderUserTable()}
                </div>
            </div>
            
            <RolePermissionTable />

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingUser ? 'Edit User' : 'Add New User'}
                >
                    <UserForm
                        initialData={editingUser}
                        onSave={handleSaveUser}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
};

export default UserManagementPage;
