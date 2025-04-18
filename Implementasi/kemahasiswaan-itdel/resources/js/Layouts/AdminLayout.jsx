import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Bell,
    Menu,
    LogOut,
    ChevronDown,
    Sun,
    Moon,
    Newspaper,
    Award,
    Heart,
    ChevronRight,
    Users, // Ikon untuk Manajemen BEM (organisasi)
    BookOpen, // Ikon untuk Beasiswa (simbol pendidikan)
    Download, // Ikon untuk Unduhan
    MessageSquare, // Ikon untuk Aspirasi (simbol komunikasi)
} from 'lucide-react';

export default function AdminLayout({
    user,
    children,
    userRole = 'admin',
    navigation = []
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const { url } = usePage();

    // Icon mapping from RoleHelper to lucide-react
    const iconMap = {
        home: LayoutDashboard,
        bell: Bell,
        newspaper: Newspaper,
        award: Award,
        heart: Heart,
        organization: Users,
        scholarship: BookOpen, // Ikon untuk Beasiswa
        download: Download, // Ikon untuk Unduhan
        aspiration: MessageSquare, // Ikon untuk Aspirasi
    };

    // Initialize dark mode based on localStorage or system preference
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode) {
            const isDark = savedMode === 'true';
            setDarkMode(isDark);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Toggle dark mode and save preference to localStorage
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const defaultNavigation = [
        {
            name: 'Dashboard',
            route: userRole === 'superadmin'
                ? 'superadmin.dashboard'
                : userRole === 'mahasiswa'
                    ? 'mahasiswa.dashboard'
                    : 'admin.dashboard',
            icon: 'home',
        },
    ];

    const menuItems = navigation.length > 0 ? navigation : defaultNavigation;

    // Debugging: Log menu items to inspect structure
    console.log('Navigation Menu Items:', menuItems);

    // Fungsi untuk memeriksa apakah rute ada di Ziggy
    const isRouteValid = (routeName) => {
        if (!routeName) {
            console.warn('Route name is undefined or null');
            return false;
        }
        try {
            const routeUrl = route(routeName);
            if (!routeUrl) {
                console.warn(`Route URL is undefined for route name: ${routeName}`);
                return false;
            }
            console.log(`Route ${routeName} is valid with URL: ${routeUrl}`);
            return true;
        } catch (e) {
            console.error(`Error checking route for ${routeName}:`, e);
            return false;
        }
    };

    const isActive = (routeName) => {
        if (!routeName) {
            console.warn('Route name is undefined or null in isActive');
            return false;
        }
        if (!isRouteValid(routeName)) {
            return false;
        }
        try {
            const routeUrl = route(routeName);
            return url.startsWith(routeUrl);
        } catch (e) {
            console.error(`Route checking error for ${routeName}:`, e);
            return false;
        }
    };

    const toggleSubmenu = (index) => {
        setExpandedMenu(expandedMenu === index ? null : index);
    };

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Desktop Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto 
                bg-white dark:bg-zinc-800 shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:block
            `}>
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex h-20 items-center justify-between px-6 border-b dark:border-zinc-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                                <img
                                    src="/assets/images/logo/logo-removebg.png"
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Kemahasiswaan</h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Institut Teknologi Del</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {menuItems.map((item, index) => {
                            const hasSubmenu = item.submenu && item.submenu.length > 0;
                            const isOpen = expandedMenu === index;
                            const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : LayoutDashboard; // Fallback ke LayoutDashboard

                            // Debugging ikon
                            console.log(`Icon for ${item.name}:`, item.icon, 'Mapped Icon:', Icon ? Icon.name : 'Not found');

                            if (hasSubmenu) {
                                const isSubmenuActive = item.submenu.some(subItem => {
                                    if (!subItem.route) {
                                        console.warn(`Submenu item "${subItem.name}" has no route defined.`);
                                        return false;
                                    }
                                    return isActive(subItem.route);
                                });

                                return (
                                    <div key={index}>
                                        <button
                                            onClick={() => toggleSubmenu(index)}
                                            className={`
                                                flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                                ${isSubmenuActive
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white'}
                                            `}
                                        >
                                            <div className="flex items-center">
                                                {Icon && (
                                                    <span className="mr-3">
                                                        <Icon className={`h-5 w-5 transition-all duration-200 ${isSubmenuActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
                                                    </span>
                                                )}
                                                <span className={`font-medium tracking-wide ${isSubmenuActive ? '' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${isSubmenuActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
                                        </button>

                                        {/* Submenu */}
                                        {isOpen && (
                                            <div className="pl-8 space-y-1 mt-1">
                                                {item.submenu.map((subItem, subIndex) => {
                                                    if (!subItem.route) {
                                                        console.warn(`Submenu item "${subItem.name}" has no route defined.`);
                                                        return null;
                                                    }
                                                    if (!isRouteValid(subItem.route)) {
                                                        console.warn(`Skipping submenu item "${subItem.name}" due to invalid route: ${subItem.route}`);
                                                        return null;
                                                    }
                                                    const isSubItemActive = isActive(subItem.route);
                                                    const routeUrl = route(subItem.route);
                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            href={routeUrl}
                                                            className={`
                                                                flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
                                                                ${isSubItemActive
                                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:text-blue-600 dark:hover:text-blue-400'}
                                                            `}
                                                        >
                                                            <span className={`font-medium ${isSubItemActive ? '' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                                                                {subItem.name}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Menu tanpa submenu
                            if (!item.route) {
                                console.warn(`Menu item "${item.name}" has no route defined.`);
                                return null;
                            }
                            if (!isRouteValid(item.route)) {
                                console.warn(`Skipping menu item "${item.name}" due to invalid route: ${item.route}`);
                                return null;
                            }
                            const isActiveRoute = isActive(item.route);
                            const routeUrl = route(item.route);
                            return (
                                <Link
                                    key={index}
                                    href={routeUrl}
                                    className={`
                                        flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                        ${isActiveRoute
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white'}
                                    `}
                                >
                                    {Icon && (
                                        <span className="mr-3">
                                            <Icon className={`h-5 w-5 transition-all duration-200 ${isActiveRoute ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
                                        </span>
                                    )}
                                    <span className={`font-medium tracking-wide ${isActiveRoute ? '' : 'group-hover:translate-x-1'} transition-transform duration-200`}>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 mt-auto">
                        <div className="bg-zinc-100 dark:bg-zinc-700/30 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Appearance</span>
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-lg bg-white dark:bg-zinc-700 shadow-sm hover:shadow-md transition-all duration-200"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? (
                                        <Sun className="h-4 w-4 text-amber-500" />
                                    ) : (
                                        <Moon className="h-4 w-4 text-indigo-500" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center space-x-4">
                            <button
                                className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <Menu className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                            </button>

                            <h1 className="text-lg font-semibold text-zinc-800 dark:text-white hidden lg:block">
                                {menuItems.find(item => item.route && isActive(item.route))?.name ||
                                    menuItems.find(item => item.submenu?.some(sub => isActive(sub.route)))?.name ||
                                    'Dashboard'}
                            </h1>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-2">
                            {/* Dark Mode Toggle (Desktop) */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors hidden lg:block"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? (
                                    <Sun className="h-5 w-5 text-amber-500" />
                                ) : (
                                    <Moon className="h-5 w-5 text-indigo-500" />
                                )}
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200">
                                <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shadow-md">
                                    3
                                </span>
                            </button>

                            {/* User Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-300">
                                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-sm">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium text-zinc-800 dark:text-white">
                                        {user?.name || 'User'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-60 text-zinc-700 dark:text-zinc-300" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-100 dark:border-zinc-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-700">
                                        <p className="text-sm font-medium text-zinc-800 dark:text-white">{user?.name || 'User'}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            className="flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-700 dark:text-zinc-300"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Link>
                                    </div>
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