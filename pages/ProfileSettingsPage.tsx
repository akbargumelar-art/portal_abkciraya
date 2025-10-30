
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const ProfileSettingsPage: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile Settings</h1>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Edit Your Profile</h2>
                <form className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <img className="h-20 w-20 rounded-full object-cover" src={user?.avatarUrl} alt="User avatar" />
                        <button type="button" className="text-sm font-medium text-red-600 hover:text-red-500">
                            Change Photo
                        </button>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            defaultValue={user?.name}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <input
                            type="text"
                            id="role"
                            defaultValue={user?.role}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter a new password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;
