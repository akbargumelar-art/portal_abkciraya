import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MENU_ITEMS } from '../constants';
import { MenuItem, UserRole } from '../types';
import { LogoutIcon, PencilIcon, LogoIcon } from './icons';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);


const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  useEffect(() => {
    const openState: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
        if (item.children?.some(child => location.pathname.startsWith(child.path!))) {
            openState[item.name] = true;
        }
    });
    setOpenMenus(openState);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          // Add logic for closing sidebar on outside click on small screens if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (name: string) => {
    if (isSidebarCollapsed) {
      // Do nothing when collapsed, hover will trigger floating menu
      return;
    } else {
        setOpenMenus(prevOpenMenus => ({ ...prevOpenMenus, [name]: !prevOpenMenus[name] }));
    }
  };

  const handleMenuMouseEnter = (name: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setHoveredMenu(name);
  };

  const handleMenuMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setHoveredMenu(null);
    }, 300); // 300ms delay
  };
  
  const accessibleMenuItems = MENU_ITEMS
    .map(item => {
        if (!user || !item.requiredRoles.includes(user.role)) {
            return null;
        }
        if (item.children) {
            const accessibleChildren = item.children.filter(child => 
                child.requiredRoles.includes(user.role)
            );
            if (accessibleChildren.length === 0) {
                return null;
            }
            return { ...item, children: accessibleChildren };
        }
        return item;
    })
    .filter((item): item is MenuItem => item !== null);

  const baseLinkClasses = "flex items-center w-full py-3.5 px-4 text-gray-500 rounded-lg transition-colors duration-200 hover:bg-red-50 hover:text-red-600 group";
  const activeLinkClasses = "bg-red-50 text-red-600 font-semibold";

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div ref={sidebarRef} className={`bg-white text-gray-800 border-r border-gray-200 transition-all duration-300 ease-in-out z-30 flex flex-col fixed inset-y-0 left-0 lg:relative transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        
        <div className={`flex items-center h-18 px-4 mb-4 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/dashboard" className={`flex items-center space-x-2 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-auto'}`}>
            <LogoIcon className="w-8 h-8 text-red-600 flex-shrink-0" />
            <span className="text-lg font-bold text-gray-800 whitespace-nowrap">Portal Cirebon Raya</span>
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className={`flex-1 px-4 space-y-1 ${isSidebarCollapsed ? '' : 'overflow-y-auto'}`}>
          {accessibleMenuItems.map((item) => {
            if (item.children) {
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => isSidebarCollapsed && handleMenuMouseEnter(item.name)}
                  onMouseLeave={() => isSidebarCollapsed && handleMenuMouseLeave()}
                >
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`${baseLinkClasses} justify-between`}
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className={`h-6 w-6 shrink-0 ${!isSidebarCollapsed ? 'mr-4' : ''}`} />}
                      {!isSidebarCollapsed && <span className="truncate text-base font-medium">{item.name}</span>}
                    </div>
                    {!isSidebarCollapsed && <ChevronDownIcon className={`transform transition-transform duration-200 ${openMenus[item.name] ? 'rotate-180' : ''}`} />}
                  </button>
                  {!isSidebarCollapsed && openMenus[item.name] && (
                    <div className="pl-8 mt-1 space-y-1">
                      {item.children.map(child => (
                        <NavLink
                          key={child.path}
                          to={child.path!}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) => `flex items-center w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-md transition-colors duration-200 ${isActive ? 'text-red-600 font-medium' : ''}`}
                        >
                          <span className="truncate">{child.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                  {isSidebarCollapsed && hoveredMenu === item.name && (
                    <div 
                        className="absolute left-full top-0 ml-2 w-52 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40 py-2"
                        onMouseEnter={() => handleMenuMouseEnter(item.name)}
                        onMouseLeave={handleMenuMouseLeave}
                    >
                      <div className="px-4 py-2 text-sm font-semibold text-gray-900 border-b mb-1">{item.name}</div>
                      <div className="space-y-1 px-2">
                        {item.children.map(child => (
                          <NavLink
                            key={child.path}
                            to={child.path!}
                            onClick={() => {
                              setSidebarOpen(false);
                              setHoveredMenu(null);
                            }}
                            className={({ isActive }) => 
                              `block w-full px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md ${isActive ? 'font-semibold bg-red-50 text-red-600' : ''}`
                            }
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                title={isSidebarCollapsed ? item.name : ''}
              >
                 <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-red-600 ${location.pathname.startsWith(item.path!) ? 'opacity-100' : 'opacity-0'}`}></div>
                {item.icon && <item.icon className={`h-6 w-6 shrink-0 ${!isSidebarCollapsed ? 'mr-4' : ''}`} />}
                {!isSidebarCollapsed && <span className="truncate text-base font-medium">{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer Section */}
        <div className="mt-auto p-4 flex-shrink-0">
            <div className="border-t border-gray-200 pt-4 relative" ref={profileMenuRef}>
               {isProfileMenuOpen && !isSidebarCollapsed && (
                <div className="absolute bottom-full mb-2 w-[calc(100%-2rem)] bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <Link
                      to="/profile-settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <PencilIcon className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Edit Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogoutIcon className="mr-3 h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className={`flex items-center p-2 rounded-lg transition-colors w-full text-left ${isProfileMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-100'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? 'Profile' : ''}
              >
                <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src={user?.avatarUrl} alt="User avatar" />
                <div className={`ml-3 flex-1 min-w-0 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                    <p className="font-semibold text-sm text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                </div>
              </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;