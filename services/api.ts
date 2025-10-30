import { MOCK_USERS } from '../constants';
import { Outlet, User } from '../types';

// --- Mock Database ---
const MOCK_OUTLETS: Record<string, Outlet> = {
  'OUTLET001': { id: 'OUTLET001', name: 'Telkomsel Grapari Cirebon', address: 'Jl. Tentara Pelajar No.1, Cirebon' },
  'OUTLET002': { id: 'OUTLET002', name: 'Mitra Cell', address: 'Jl. Siliwangi No. 123, Cirebon' },
  'OUTLET003': { id: 'OUTLET003', name: 'Pahlawan Phone', address: 'Jl. Pahlawan No. 45, Cirebon' },
};

// --- Authentication ---
export const login = (username: string): Promise<User | null> => {
    console.log(`Attempting login for: ${username}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = MOCK_USERS[username.toLowerCase()];
            if (user) {
                console.log('Login successful:', user);
                resolve(user);
            } else {
                console.log('Login failed: User not found');
                resolve(null);
            }
        }, 500);
    });
};

export const logout = (): void => {
    console.log('User logged out');
};


// --- Form Services ---
export const lookupOutlet = (outletId: string): Promise<Outlet | null> => {
    console.log(`Looking up outlet with ID: ${outletId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const outlet = MOCK_OUTLETS[outletId.toUpperCase()];
            if (outlet) {
                console.log('Outlet found:', outlet);
                resolve(outlet);
            } else {
                console.log('Outlet not found');
                resolve(null);
            }
        }, 700);
    });
};

export const submitVisitForm = (formData: unknown): Promise<{ success: boolean; message: string }> => {
    console.log('Submitting form data:', formData);

    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate triggering webhook
            triggerWebhook(formData);
            resolve({ success: true, message: 'Form submitted successfully!' });
        }, 1000);
    });
};

const triggerWebhook = (payload: unknown) => {
    const webhookUrl = 'https://waha.abkciraya.cloud/sentText'; // Example URL
    console.log(`%c[WEBHOOK TRIGGERED]`, 'color: #4CAF50; font-weight: bold;');
    console.log(`Endpoint: ${webhookUrl}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // In a real app, you would use fetch() here:
    /*
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => console.log('Webhook response:', response.status))
    .catch(error => console.error('Webhook error:', error));
    */
};

// --- Connection Settings Services ---
const API_BASE_URL = 'http://localhost:3001/api'; // The address of your backend server

export const testConnection = async (settings: unknown): Promise<{ success: boolean; message: string }> => {
  console.log('Sending test connection request to backend:', settings);
  try {
    const response = await fetch(`${API_BASE_URL}/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();
    if (!response.ok) {
        // If the server returns an error (status 4xx or 5xx)
        throw new Error(result.message || 'An error occurred on the server.');
    }
    return result;
  } catch (error) {
    // If there's a network issue or the fetch fails
    console.error("Error testing connection:", error);
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('Failed to fetch')) {
        return { success: false, message: 'Gagal terhubung ke server backend. Pastikan server backend (Node.js) sudah berjalan.' };
    }
    return { success: false, message: errorMessage };
  }
};

export const saveConnectionSettings = async (settings: unknown): Promise<{ success: boolean; message: string }> => {
  console.log('Sending settings to save to backend:', settings);
   try {
    const response = await fetch(`${API_BASE_URL}/save-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'An error occurred on the server.');
    }
    return result;
  } catch (error) {
    console.error("Error saving settings:", error);
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('Failed to fetch')) {
        return { success: false, message: 'Gagal menyimpan ke server backend. Pastikan server sudah berjalan.' };
    }
    return { success: false, message: errorMessage };
  }
};