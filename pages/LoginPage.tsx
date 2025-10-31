import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('agus.purnomo'); // Pre-fill for demo convenience
  const [password, setPassword] = useState('password'); // Dummy password for UI
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      // Navigation will happen automatically in App.tsx
    } catch (err) {
      setError('Username atau password tidak valid. Silakan periksa kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="flex rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden bg-white">
        {/* Left Decorative Panel */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-red-700 to-red-900 text-white p-12 flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-wider">Portal Access</h1>
            <p className="text-red-200 mt-1">PT Agrabudi Komunika</p>
          </div>
          <div className="my-8">
            <h2 className="text-4xl font-extrabold leading-tight mb-3">Selamat Datang Kembali!</h2>
            <div className="w-20 h-1 bg-white mb-4"></div>
            <p className="text-red-100/90">
              Solusi satu atap Anda untuk manajemen penjualan dan kinerja tim.
              Silakan masuk untuk melanjutkan.
            </p>
          </div>
          <div className="mt-auto text-sm text-red-300">
            &copy; {new Date().getFullYear()} Agrabudi Komunika. All rights reserved.
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-600 mb-8">Sign in to access your dashboard.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="e.g., agus.purnomo"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                 <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <a href="#" tabIndex={-1} className="text-sm font-medium text-red-600 hover:text-red-500">
                    Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
