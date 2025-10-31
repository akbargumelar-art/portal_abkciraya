
import React from 'react';
import { useLocation } from 'react-router-dom';
import { BellIcon } from './icons';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
}

const pathTitleMap = new Map<string, string>();

function buildPathMap(items: MenuItem[], prefix = '') {
  items.forEach(item => {
    if (item.path) {
      pathTitleMap.set(item.path, item.name);
    }
    if (item.children) {
      buildPathMap(item.children, item.name);
    }
  });
}
buildPathMap(MENU_ITEMS);

// Add manual overrides for specific pages or sections
pathTitleMap.set('/profile-settings', 'Profile Settings');
pathTitleMap.set('/admin', 'Admin Panel');
pathTitleMap.set('/admin/user-management', 'User Management');


const getPageTitle = (pathname: string): string => {
  // Exact match first
  if (pathTitleMap.has(pathname)) {
    return pathTitleMap.get(pathname) || 'Dashboard';
  }
  // Find parent match
  const segments = pathname.split('/').filter(Boolean);
  for (let i = segments.length; i > 0; i--) {
    const path = `/${segments.slice(0, i).join('/')}`;
    if (pathTitleMap.has(path)) {
      return pathTitleMap.get(path) || 'Dashboard';
    }
  }
  return 'Dashboard';
};


const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-18 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
         <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden mr-4">
             <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
         </button>
         <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
          <BellIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;