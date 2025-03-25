import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AdminLayout({
    user,
    children,
    userRole,
    permissions,
    navigation,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const defaultNavigation = [
        {
            name: 'Dashboard',
            route:
                userRole === 'superadmin'
                    ? 'superadmin.dashboard'
                    : userRole === 'mahasiswa'
                        ? 'mahasiswa.dashboard'
                        : 'admin.dashboard',
            icon: 'tachometer-alt',
            visible: true,
        },
    ];

    const menuItems =
        Array.isArray(navigation) && navigation.length > 0
            ? navigation
            : defaultNavigation;

    const isActive = (routeName) => {
        if (!routeName) return false;
        try {
            const routeUrl = route(routeName);
            return url.startsWith(routeUrl);
        } catch (e) {
            console.error('Error checking route: ', e);
            return false;
        }
    };


    useEffect(() => {
        if (!document.querySelector('link[href*="fontawesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href =
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transition-all duration-300 lg:flex lg:flex-shrink-0 ">
                <div className="flex h-full flex-col">
                    <div className="flex h-20 flex-shrink-0 items-center justify-between bg-gray-950/50 px-6 border-b border-gray-700/50 backdrop-blur-sm">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-10 w-auto fill-current text-indigo-400 transition-transform duration-300 hover:scale-110" />
                            <span className="ml-3 text-xl font-bold text-white tracking-tight">
                                Admin Panel
                            </span>
                        </div>
                    </div>

                    <nav className="mt-6 flex-1 space-y-2 px-4">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={route(item.route)}
                                className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive(item.route)
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-sm'
                                    }`}
                            >
                                <i
                                    className={`fas fa-${item.icon || 'circle'} mr-4 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive(item.route) ? 'text-indigo-200' : 'text-gray-400'
                                        }`}
                                ></i>
                                <span className="font-medium tracking-wide">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-40 flex lg:hidden ${sidebarOpen ? 'visible' : 'invisible'
                    }`}
            >
                <div
                    className={`fixed inset-0 bg-gray-900 ${sidebarOpen ? 'opacity-75' : 'opacity-0'
                        } transition-opacity duration-300`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
                <div
                    className={`relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="absolute right-0 top-0 pt-4 pr-4">
                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className="fas fa-times h-6 w-6"></i>
                        </button>
                    </div>
                    <div className="flex h-20 flex-shrink-0 items-center px-6 border-b border-gray-700/50">
                        <ApplicationLogo className="h-10 w-auto fill-current text-indigo-400" />
                        <span className="ml-3 text-xl font-bold text-white tracking-tight">
                            Admin Panel
                        </span>
                    </div>

                    <nav className="mt-6 flex-1 space-y-2 px-4">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={route(item.route)}
                                className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive(item.route)
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-sm'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <i
                                    className={`fas fa-${item.icon || 'circle'} mr-4 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive(item.route) ? 'text-indigo-200' : 'text-gray-400'
                                        }`}
                                ></i>
                                <span className="font-medium tracking-wide">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:pl-72">
                {/* Top Bar */}
                <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg lg:shadow-xl sticky top-0 z-40">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Left Section */}
                        <div className="flex items-center">
                            {/* Mobile Menu Button */}
                            <button
                                className="text-gray-300 hover:text-white focus:outline-none lg:hidden transition-colors duration-200"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <i className="fas fa-bars h-6 w-6"></i>
                            </button>
                            {/* Breadcrumb / Title */}
                            <div className="hidden lg:flex items-center ml-6">
                                <h1 className="text-lg font-semibold text-white tracking-wide">
                                    {menuItems.find(item => isActive(item.route))?.name || 'Dashboard'}
                                </h1>
                                <span className="ml-2 text-sm text-indigo-300">
                                    / {userRole || 'Guest'}
                                </span>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <button className="relative text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none">
                                <i className="fas fa-bell h-6 w-6"></i>
                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* User Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-medium text-white shadow-md">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                    <span className="hidden sm:inline text-sm font-medium">
                                        {user?.name || 'User'}
                                    </span>
                                    <i className="fas fa-chevron-down h-4 w-4"></i>
                                </button>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                                    <div className="py-1">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-500"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-500"
                                        >
                                            Logout
                                        </Link>
                        </div>
                        
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 lg:px-8">
                            {children}

                            
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}