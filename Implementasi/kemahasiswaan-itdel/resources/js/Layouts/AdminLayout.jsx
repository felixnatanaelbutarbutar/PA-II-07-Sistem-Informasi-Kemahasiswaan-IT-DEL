import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Bell,
    Menu,
    LogOut,
    ChevronDown
} from 'lucide-react';

export default function AdminLayout({
    user,
    children,
    userRole = 'admin',
    navigation = []
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const defaultNavigation = [
        {
            name: 'Dashboard',
            route: userRole === 'superadmin'
                ? 'superadmin.dashboard'
                : userRole === 'mahasiswa'
                    ? 'mahasiswa.dashboard'
                    : 'admin.dashboard',
            icon: LayoutDashboard,
        },
    ];

    const menuItems = navigation.length > 0
        ? navigation
        : defaultNavigation;

    const isActive = (routeName) => {
        try {
            const routeUrl = route(routeName);
            return url.startsWith(routeUrl);
        } catch (e) {
            console.error('Route checking error:', e);
            return false;
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Desktop Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto 
        bg-white dark:bg-zinc-800 border-r dark:border-zinc-700 
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:block
      `}>
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex h-20 items-center justify-between px-6 border-b dark:border-zinc-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Admin Panel</h2>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={route(item.route)}
                                className={`
                  flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all 
                  ${isActive(item.route)
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'}
                `}
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

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-b dark:border-zinc-700">
                    <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center space-x-4">
                            <button
                                className="lg:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <Menu className="h-6 w-6" />
                            </button>

                            <h1 className="text-lg font-semibold text-zinc-800 dark:text-white hidden lg:block">
                                {menuItems.find(item => isActive(item.route))?.name || 'Dashboard'}
                            </h1>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                                    3
                                </span>
                            </button>

                            {/* User Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">
                                    <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium">
                                        {user?.name || 'User'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-60" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border dark:border-zinc-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        className="flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}