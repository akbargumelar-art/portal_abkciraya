import { User, Outlet, OutletData, UserRole, UserFormData } from '../types';

const API_BASE_URL = '/api'; // Proxy to your backend server

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
    // Handle cases where the response might be empty (e.g., DELETE 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return { success: true };
};

// --- Authentication ---
// Mock users for login purposes ONLY, allowing prototype testing without a live database.
const MOCK_USERS_FOR_LOGIN: User[] = [
    { id: '1', name: 'Agus Purnomo', username: 'agus.purnomo', role: UserRole.AdminSuper, avatarUrl: 'https://i.pravatar.cc/150?u=agus' },
    { id: '2', name: 'Budi Input', username: 'budi.input', role: UserRole.AdminInput, avatarUrl: 'https://i.pravatar.cc/150?u=budi' },
    { id: '3', name: 'Cici Manager', username: 'cici.manager', role: UserRole.Manager, avatarUrl: 'https://i.pravatar.cc/150?u=cici' },
    { id: '4', name: 'Dedi SPV IDS', username: 'dedi.spvids', role: UserRole.SupervisorIDS, avatarUrl: 'https://i.pravatar.cc/150?u=dedi' },
    { id: '5', name: 'Eka SPV D2C', username: 'eka.spvd2c', role: UserRole.SupervisorD2C, avatarUrl: 'https://i.pravatar.cc/150?u=eka' },
    { id: '6', name: 'Fani Salesforce', username: 'fani.salesforce', role: UserRole.SalesforceIDS, avatarUrl: 'https://i.pravatar.cc/150?u=fani' },
    { id: '7', name: 'Gita Direct Sales', username: 'gita.directsales', role: UserRole.DirectSalesD2C, avatarUrl: 'https://i.pravatar.cc/150?u=gita' },
];

export const login = async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
    // This function is mocked for prototype testing. It does NOT hit the backend.
    console.log(`Attempting login for: ${username}`);
    
    // Find user in the mock list
    const user = MOCK_USERS_FOR_LOGIN.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && password) { // In this mock, any password will work
        console.log('Simulating successful login with mock data');
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

// --- User Management Services (Connected to Backend) ---
export const getUsers = async (): Promise<User[]> => {
    console.log('API: Fetching users from backend...');
    // This function remains connected to the live backend.
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
};

export const addUser = async (userData: UserFormData): Promise<User> => {
    console.log('API: Sending new user to backend...', userData);
    return authedFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<User> => {
    console.log(`API: Sending user update to backend for ID ${userId}...`, userData);
    return authedFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    console.log(`API: Sending delete request to backend for ID ${userId}...`);
    return authedFetch(`/users/${userId}`, {
        method: 'DELETE',
    });
};


// --- Connection Settings Services (Connecting to Live Backend) ---
export const testConnection = async (settings: any): Promise<{ success: boolean; message: string }> => {
    console.log('API: Calling backend to test connection...', settings);
    const response = await fetch(`${API_BASE_URL}/test-connection`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });

    const data = await response.json();
    if (!response.ok) {
        // Throw an error with the message from the backend
        throw new Error(data.message || `Server responded with status ${response.status}`);
    }
    return data;
};

export const saveConnectionSettings = async (settings: any): Promise<{ success: boolean; message: string }> => {
    console.log('API: Calling backend to save connection settings...', settings);
    const response = await fetch(`${API_BASE_URL}/save-connection`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Server responded with status ${response.status}`);
    }
    return data;
};