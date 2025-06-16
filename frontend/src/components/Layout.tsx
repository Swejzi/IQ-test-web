import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectIsAuthenticated, selectUser, logout } from '@/store/slices/authSlice';
import { selectSidebarOpen, toggleSidebar } from '@/store/slices/uiSlice';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  ClockIcon,
  InformationCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { BaseComponentProps } from '@/types';

interface LayoutProps extends BaseComponentProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const sidebarOpen = useAppSelector(selectSidebarOpen);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigation = [
    { name: 'Domů', href: '/', icon: HomeIcon, current: location.pathname === '/' },
    { name: 'IQ Test', href: '/test', icon: AcademicCapIcon, current: location.pathname.startsWith('/test') },
    { name: 'Výsledky', href: '/results', icon: ChartBarIcon, current: location.pathname.startsWith('/results') },
    ...(isAuthenticated ? [
      { name: 'Historie', href: '/history', icon: ClockIcon, current: location.pathname === '/history' },
    ] : []),
    { name: 'O testu', href: '/about', icon: InformationCircleIcon, current: location.pathname === '/about' },
  ];

  const userNavigation = [
    ...(user?.email?.includes('admin') ? [
      { name: 'Administrace', href: '/admin', icon: Cog6ToothIcon },
    ] : []),
    { name: 'Profil', href: '/profile', icon: UserIcon },
    { name: 'Odhlásit se', href: '#', icon: ArrowRightOnRectangleIcon, onClick: handleLogout },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 ${className}`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-neutral-600 bg-opacity-75" onClick={() => dispatch(toggleSidebar())} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold gradient-text">IQ Test</span>
            </Link>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
                onClick={() => dispatch(toggleSidebar())}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-neutral-200 shadow-sm">
          <div className="flex h-16 items-center px-4">
            <Link to="/" className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold gradient-text">IQ Test</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User section */}
          {isAuthenticated && user && (
            <div className="border-t border-neutral-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {user.username || user.email || 'Anonymní uživatel'}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {user.email ? 'Registrovaný' : 'Anonymní session'}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={item.onClick}
                    className="group flex items-center px-2 py-1 text-xs font-medium text-neutral-600 rounded-md hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-neutral-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-lg font-bold gradient-text">IQ Test</span>
            </Link>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                <span className="ml-2 text-sm text-neutral-600">
                  © 2024 IQ Test Web Application. Všechna práva vyhrazena.
                </span>
              </div>
              <div className="flex space-x-6 text-sm text-neutral-600">
                <Link to="/privacy" className="hover:text-primary-600 transition-colors">
                  Ochrana soukromí
                </Link>
                <Link to="/terms" className="hover:text-primary-600 transition-colors">
                  Podmínky použití
                </Link>
                <Link to="/contact" className="hover:text-primary-600 transition-colors">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
