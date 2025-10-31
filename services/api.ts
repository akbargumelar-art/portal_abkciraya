import { User, Outlet, OutletData, UserRole, UserFormData } from '../types';

const API_BASE_URL = '/api'; // Proxy to your backend server

// --- Mock Data ---
let mockUsers: User[] = [
    { id: 'user01', name: 'Agus Purnomo', username: 'agus.purnomo', role: UserRole.AdminSuper, avatarUrl: 'https://i.pravatar.cc/150?u=agus' },
    { id: 'user02', name: 'Budi Input', username: 'budi.input', role: UserRole.AdminInput, avatarUrl: 'https://i.pravatar.cc/150?u=budi' },
    { id: 'user03', name: 'Cici Manager', username: 'cici.manager', role: UserRole.Manager, avatarUrl: 'https://i.pravatar.cc/150?u=cici' },
    { id: 'user04', name: 'Dedi SPV IDS', username: 'dedi.spvids', role: UserRole.SupervisorIDS, avatarUrl: 'https://i.pravatar.cc/150?u=dedi' },
    { id: 'user05', name: 'Eka SPV D2C', username: 'eka.spvd2c', role: UserRole.SupervisorD2C, avatarUrl: 'https://i.pravatar.cc/150?u=eka' },
    { id: 'user06', name: 'Fani Salesforce', username: 'fani.salesforce', role: UserRole.SalesforceIDS, avatarUrl: 'https://i.pravatar.cc/150?u=fani' },
    { id: 'user07', name: 'Gita Direct Sales', username: 'gita.directsales', role: UserRole.DirectSalesD2C, avatarUrl: 'https://i.pravatar.cc/150?u=gita' },
];


// Helper function for authenticated requests
const authedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// --- Authentication ---
export const login = async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
    console.log(`Attempting login for: ${username}`);
    const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && password) { // In real app, password would be checked against a hash
        console.log('Simulating successful login');
        return Promise.resolve({ user, token: 'fake-jwt-token-for-demo' });
    } else {
        return Promise.reject(new Error('Invalid credentials'));
    }
};

export const logout = (): void => {
    console.log('User logged out');
};

// --- Data Services ---
export const getOutlets = (): Promise<OutletData[]> => {
    console.log("Fetching outlets... (simulated - returning empty array)");
    return Promise.resolve([]);
};

// --- Form Services ---
export const lookupOutlet = (outletId: string): Promise<Outlet | null> => {
    return authedFetch(`/outlets/${outletId}`);
};

export const submitVisitForm = (formData: unknown): Promise<{ success: boolean; message: string }> => {
    return authedFetch('/visits', {
        method: 'POST',
        body: JSON.stringify(formData),
    });
};

// --- User Management Services (Mocked) ---
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getUsers = async (): Promise<User[]> => {
    await simulateDelay(500);
    console.log('API: getUsers called', mockUsers);
    return Promise.resolve([...mockUsers]);
};

export const addUser = async (userData: UserFormData): Promise<User> => {
    await simulateDelay(500);
    const newUser: User = {
        id: `user${Date.now()}`,
        ...userData,
    };
    mockUsers.push(newUser);
    console.log('API: addUser called', newUser);
    return Promise.resolve(newUser);
};

export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<User> => {
    await simulateDelay(500);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return Promise.reject(new Error('User not found'));
    }
    // Don't update password if it's empty
    const { password, ...restOfData } = userData;
    const updatedData = { ...restOfData };
    
    const updatedUser = { ...mockUsers[userIndex], ...updatedData };
    mockUsers[userIndex] = updatedUser;
    console.log('API: updateUser called', updatedUser);
    return Promise.resolve(updatedUser);
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    await simulateDelay(500);
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(u => u.id !== userId);
    if (mockUsers.length === initialLength) {
        return Promise.reject(new Error('User not found'));
    }
    console.log('API: deleteUser called for', userId);
    return Promise.resolve({ success: true });
};

// --- Connection Settings Services (Mocked) ---
export const testConnection = async (settings: any): Promise<{ success: boolean; message: string }> => {
    await simulateDelay(1000);
    // Simulate success if all fields are present. The component sends a dummy password if empty.
    if (settings.host && settings.port && settings.username && settings.password && settings.dbname) {
        console.log('API: testConnection successful', settings);
        return Promise.resolve({ success: true, message: 'Koneksi berhasil! Database dapat diakses.' });
    } else {
        console.log('API: testConnection failed', settings);
        return Promise.resolve({ success: false, message: 'Koneksi gagal. Periksa kembali detail koneksi Anda.' });
    }
};

export const saveConnectionSettings = async (settings: any): Promise<{ success: boolean; message: string }> => {
    await simulateDelay(1000);
    if (settings.host && settings.port && settings.username && settings.password && settings.dbname) {
        console.log('API: saveConnectionSettings successful', settings);
        return Promise.resolve({ success: true, message: 'Pengaturan koneksi berhasil disimpan.' });
    } else {
        console.log('API: saveConnectionSettings failed', settings);
        return Promise.resolve({ success: false, message: 'Gagal menyimpan. Pastikan semua field terisi.' });
    }
};
