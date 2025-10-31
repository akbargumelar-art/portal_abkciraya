import { User, Outlet, OutletData } from '../types';

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
    return response.json();
};

// --- Authentication ---
export const login = async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
    console.log(`Attempting login for: ${username}`);
    // This is a mock API call. In a real scenario, this would be a POST request to a backend.
    // For now, we simulate a successful login for any of the previous mock users for demonstration purposes.
    const validUsernames = ['agus.purnomo', 'budi.input', 'cici.manager', 'dedi.spvids', 'eka.spvd2c', 'fani.salesforce', 'gita.directsales'];
    if (validUsernames.includes(username.toLowerCase()) && password) {
        console.log('Simulating successful login');
        const userMap: Record<string, User> = {
          'agus.purnomo': { id: 'user01', name: 'Agus Purnomo', role: 'Admin Super' as any, avatarUrl: 'https://i.pravatar.cc/150?u=agus' },
          'budi.input': { id: 'user02', name: 'Budi Input', role: 'Admin Input Data' as any, avatarUrl: 'https://i.pravatar.cc/150?u=budi' },
          'cici.manager': { id: 'user03', name: 'Cici Manager', role: 'Manager' as any, avatarUrl: 'https://i.pravatar.cc/150?u=cici' },
          'dedi.spvids': { id: 'user04', name: 'Dedi SPV IDS', role: 'Supervisor (IDS)' as any, avatarUrl: 'https://i.pravatar.cc/150?u=dedi' },
          'eka.spvd2c': { id: 'user05', name: 'Eka SPV D2C', role: 'Supervisor Direct Sales (D2C)' as any, avatarUrl: 'https://i.pravatar.cc/150?u=eka' },
          'fani.salesforce': { id: 'user06', name: 'Fani Salesforce', role: 'Salesforce (IDS)' as any, avatarUrl: 'https://i.pravatar.cc/150?u=fani' },
          'gita.directsales': { id: 'user07', name: 'Gita Direct Sales', role: 'Direct Sales (D2C)' as any, avatarUrl: 'https://i.pravatar.cc/150?u=gita' },
        }
        return Promise.resolve({ user: userMap[username.toLowerCase()], token: 'fake-jwt-token-for-demo' });
    } else {
        return Promise.reject(new Error('Invalid credentials'));
    }
    /*
    // REAL IMPLEMENTATION EXAMPLE:
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
    */
};

export const logout = (): void => {
    console.log('User logged out');
    // In a real app, you might also call a backend endpoint to invalidate the token
    // authedFetch('/auth/logout', { method: 'POST' });
};

// --- Data Services ---
export const getOutlets = (): Promise<OutletData[]> => {
    // This function would fetch all outlet data from the backend.
    // Since we don't have a backend, we return an empty array to show the "no data" state.
    console.log("Fetching outlets... (simulated - returning empty array)");
    return Promise.resolve([]);
    /* 
    // REAL IMPLEMENTATION EXAMPLE:
    return authedFetch('/outlets');
    */
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

// --- Connection Settings Services ---
export const testConnection = async (settings: unknown): Promise<{ success: boolean; message: string }> => {
  return authedFetch('/admin/connections/test', {
    method: 'POST',
    body: JSON.stringify(settings)
  });
};

export const saveConnectionSettings = async (settings: unknown): Promise<{ success: boolean; message: string }> => {
  return authedFetch('/admin/connections/save', {
    method: 'POST',
    body: JSON.stringify(settings)
  });
};
