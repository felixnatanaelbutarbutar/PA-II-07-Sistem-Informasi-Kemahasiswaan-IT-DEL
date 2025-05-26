    import React, { useState, useEffect } from 'react';
    import { Link, usePage } from '@inertiajs/react';
    import { Toaster } from 'react-hot-toast';

    import {
        LayoutDashboard,
        Bell,
        Menu,
        LogOut,
        ChevronDown,
        Sun,
        Moon,
        Droplet,
        Cloud,
        Newspaper,
        Award,
        Heart,
        ChevronRight,
        Users,
        BookOpen,
        Download,
        MessageSquare,
        Image,
        Clipboard,
        Megaphone // Tambahkan ikon Clipboard untuk form
    } from 'lucide-react';

    export default function AdminLayout({
        user,
        children,
        userRole = 'admin',
        navigation = []
    }) {
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const [theme, setTheme] = useState('light');
        const [expandedMenu, setExpandedMenu] = useState(null);
        const [showThemeDropdown, setShowThemeDropdown] = useState(false);
        const { url } = usePage();

        // Icon mapping from RoleHelper to lucide-react
        const iconMap = {
            home: LayoutDashboard,
            bell: Bell,
            newspaper: Newspaper,
            award: Award,
            heart: Heart,
            organization: Users,
            scholarship: BookOpen,
            download: Download,
            aspiration: MessageSquare,
            carousel: Image,
            chatbot: MessageSquare,
            calendar: Bell,
            form: Clipboard,
            directors: Megaphone,
        };

        // Theme definitions with their icons
        const themes = [
            { name: 'light', label: 'Light', icon: Sun, color: 'amber-500' },
            { name: 'dark', label: 'Dark', icon: Moon, color: 'indigo-500' },
            { name: 'light-blue', label: 'Light Blue', icon: Droplet, color: 'blue-300' },
            { name: 'dark-blue', label: 'Dark Blue', icon: Cloud, color: 'blue-800' },
        ];

        // Initialize theme based on localStorage or system preference
        useEffect(() => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && themes.some(t => t.name === savedTheme)) {
                setTheme(savedTheme);
                document.documentElement.classList.add(savedTheme);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
            } else {
                setTheme('light');
                document.documentElement.classList.add('light');
            }
        }, []);

        // Update theme and save to localStorage
        const changeTheme = (newTheme) => {
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Remove all theme classes
            themes.forEach(t => document.documentElement.classList.remove(t.name));
            // Add the selected theme class
            document.documentElement.classList.add(newTheme);
            setShowThemeDropdown(false);
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

        // console.log('Navigation Menu Items:', menuItems);

        const isRouteValid = (routeName) => {
            if (!routeName) {
                // console.warn('Route name is undefined or null');
                return false;
            }
            try {
                const routeUrl = route(routeName);
                return !!routeUrl;
            } catch (e) {
                // console.error(`Error checking route for ${routeName}:`, e);
                return false;
            }
        };

        const isActive = (routeName) => {
            if (!routeName || !isRouteValid(routeName)) {
                console.warn(`Route invalid or undefined: ${routeName}`);
                return false;
            }
            try {
                const routeUrl = route(routeName);  
                const baseUrl = url.split('?')[0]; // Path relatif dari current URL
                // Ekstrak path dari routeUrl (hapus protokol dan domain)
                const baseRouteUrl = routeUrl.replace(/^https?:\/\/[^\/]+/, '');
                // console.log(`Checking route: ${routeName}, Base URL: ${baseUrl}, Base Route URL: ${baseRouteUrl}`);
                const isActive = baseUrl === baseRouteUrl || baseUrl.startsWith(baseRouteUrl + '/');
                // console.log(`Is Active for ${routeName}: ${isActive}`);
                return isActive;
            } catch (e) {
                    // console.error(`Route checking error for ${routeName}:`, e);
                return false;
            }
        };
        const toggleSubmenu = (index) => {
            setExpandedMenu(expandedMenu === index ? null : index);
        };

        return (
            <div className={`flex min-h-screen transition-colors duration-300
                ${theme === 'light' ? 'bg-zinc-50' : ''}
                ${theme === 'dark' ? 'bg-zinc-900' : ''}
                ${theme === 'light-blue' ? 'bg-blue-50' : ''}
                ${theme === 'dark-blue' ? 'bg-blue-900' : ''}`}>
                {/* Desktop Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-75 overflow-y-auto 
                    shadow-lg transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:block
                    ${theme === 'light' ? 'bg-white' : ''}
                    ${theme === 'dark' ? 'bg-zinc-800' : ''}
                    ${theme === 'light-blue' ? 'bg-white' : ''}
                    ${theme === 'dark-blue' ? 'bg-blue-950' : ''}
                `}>
                    <div className="flex h-full flex-col">
                        {/* Sidebar Header */}
                        <div className={`flex h-20 items-center justify-between px-6 border-b 
                            ${theme === 'light' ? 'border-zinc-200' : ''}
                            ${theme === 'dark' ? 'border-zinc-700' : ''}
                            ${theme === 'light-blue' ? 'border-blue-200' : ''}
                            ${theme === 'dark-blue' ? 'border-blue-800' : ''}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md
                                    ${theme === 'light-blue' ? 'bg-blue-100' : ''}
                                    ${theme === 'dark-blue' ? 'bg-blue-800' : ''}`}>
                                    <img
                                        src="/assets/images/logo/logo-removebg.png"
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold bg-clip-text text-transparent
                                        ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}
                                        ${theme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                                        ${theme === 'light-blue' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : ''}
                                        ${theme === 'dark-blue' ? 'bg-gradient-to-r from-blue-300 to-indigo-400' : ''}`}>
                                        Kemahasiswaan
                                    </h2>
                                    <p className={`text-xs
                                        ${theme === 'light' ? 'text-zinc-500' : ''}
                                        ${theme === 'dark' ? 'text-zinc-400' : ''}
                                        ${theme === 'light-blue' ? 'text-blue-600' : ''}
                                        ${theme === 'dark-blue' ? 'text-blue-300' : ''}`}>
                                        Institut Teknologi Del
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-1 px-4 py-6 space-y-1">
                            {menuItems.map((item, index) => {
                                const hasSubmenu = item.submenu && item.submenu.length > 0;
                                const isOpen = expandedMenu === index;
                                const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : LayoutDashboard;

                                {/* console.log(`Icon for ${item.name}:`, item.icon, 'Mapped Icon:', Icon ? Icon.name : 'Not found'); */}

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
                                                        : `${theme === 'light' ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' : ''}
                                                        ${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50 hover:text-white' : ''}
                                                        ${theme === 'light-blue' ? 'text-blue-700 hover:bg-blue-100 hover:text-blue-900' : ''}
                                                        ${theme === 'dark-blue' ? 'text-blue-200 hover:bg-blue-800 hover:text-white' : ''}`}
                                                `}>
                                                <div className="flex items-center">
                                                    {Icon && (
                                                        <span className="mr-3">
                                                            <Icon className={`h-5 w-5 transition-all duration-200
                                                                ${isSubmenuActive ? 'text-white' : 
                                                                `${theme === 'light' ? 'text-zinc-500 group-hover:text-blue-500' : ''}
                                                                ${theme === 'dark' ? 'text-zinc-400 group-hover:text-blue-400' : ''}
                                                                ${theme === 'light-blue' ? 'text-blue-500 group-hover:text-blue-700' : ''}
                                                                ${theme === 'dark-blue' ? 'text-blue-300 group-hover:text-blue-100' : ''}`}`} />
                                                        </span>
                                                    )}
                                                    <span className={`font-medium tracking-wide ${isSubmenuActive ? '' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}
                                                    ${isSubmenuActive ? 'text-white' : 
                                                    `${theme === 'light' ? 'text-zinc-500 group-hover:text-blue-500' : ''}
                                                    ${theme === 'dark' ? 'text-zinc-400 group-hover:text-blue-400' : ''}
                                                    ${theme === 'light-blue' ? 'text-blue-500 group-hover:text-blue-700' : ''}
                                                    ${theme === 'dark-blue' ? 'text-blue-300 group-hover:text-blue-100' : ''}`}`} />
                                            </button>

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
                                                                        ? `${theme === 'light' ? 'bg-blue-50 text-blue-600' : ''}
                                                                        ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : ''}
                                                                        ${theme === 'light-blue' ? 'bg-blue-100 text-blue-700' : ''}
                                                                        ${theme === 'dark-blue' ? 'bg-blue-800 text-blue-200' : ''}`
                                                                        : `${theme === 'light' ? 'text-zinc-600 hover:bg-zinc-100 hover:text-blue-600' : ''}
                                                                        ${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50 hover:text-blue-400' : ''}
                                                                        ${theme === 'light-blue' ? 'text-blue-700 hover:bg-blue-100 hover:text-blue-800' : ''}
                                                                        ${theme === 'dark-blue' ? 'text-blue-200 hover:bg-blue-800 hover:text-blue-100' : ''}`}
                                                                `}>
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

                                if (!item.route) {
                                    {/* console.warn(`Menu item "${item.name}" has no route defined.`); */}
                                    return null;
                                }
                                if (!isRouteValid(item.route)) {
                                    {/* console.warn(`Skipping menu item "${item.name}" due to invalid route: ${item.route}`); */}
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
                                                : `${theme === 'light' ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' : ''}
                                                ${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50 hover:text-white' : ''}
                                                ${theme === 'light-blue' ? 'text-blue-700 hover:bg-blue-100 hover:text-blue-900' : ''}
                                                ${theme === 'dark-blue' ? 'text-blue-200 hover:bg-blue-800 hover:text-white' : ''}`}
                                        `}>
                                        {Icon && (
                                            <span className="mr-3">
                                                <Icon className={`h-5 w-5 transition-all duration-200
                                                    ${isActiveRoute ? 'text-white' : 
                                                    `${theme === 'light' ? 'text-zinc-500 group-hover:text-blue-500' : ''}
                                                    ${theme === 'dark' ? 'text-zinc-400 group-hover:text-blue-400' : ''}
                                                    ${theme === 'light-blue' ? 'text-blue-500 group-hover:text-blue-700' : ''}
                                                    ${theme === 'dark-blue' ? 'text-blue-300 group-hover:text-blue-100' : ''}`}`} />
                                            </span>
                                        )}
                                        <span className={`font-medium tracking-wide ${isActiveRoute ? '' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Bottom Section */}
                        <div className="p-4 mt-auto">
                            <div className={`rounded-xl p-4
                                ${theme === 'light' ? 'bg-zinc-100' : ''}
                                ${theme === 'dark' ? 'bg-zinc-700/30' : ''}
                                ${theme === 'light-blue' ? 'bg-blue-100' : ''}
                                ${theme === 'dark-blue' ? 'bg-blue-800' : ''}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`text-xs font-medium
                                        ${theme === 'light' ? 'text-zinc-500' : ''}
                                        ${theme === 'dark' ? 'text-zinc-400' : ''}
                                        ${theme === 'light-blue' ? 'text-blue-600' : ''}
                                        ${theme === 'dark-blue' ? 'text-blue-200' : ''}`}>
                                        Appearance
                                    </span>
                                    <button
                                        onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                                        className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                            ${theme === 'light' ? 'bg-white' : ''}
                                            ${theme === 'dark' ? 'bg-zinc-700' : ''}
                                            ${theme === 'light-blue' ? 'bg-blue-50' : ''}
                                            ${theme === 'dark-blue' ? 'bg-blue-700' : ''}`}>
                                        {themes.find(t => t.name === theme)?.icon && React.createElement(themes.find(t => t.name === theme).icon, {
                                            className: `h-4 w-4 text-${themes.find(t => t.name === theme).color}`
                                        })}
                                    </button>
                                </div>
                                {/* Theme Dropdown */}
                                {showThemeDropdown && (
                                    <div className={`absolute bottom-20 left-4 w-60 rounded-lg shadow-xl border
                                        ${theme === 'light' ? 'bg-white border-zinc-100' : ''}
                                        ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                                        ${theme === 'light-blue' ? 'bg-blue-50 border-blue-200' : ''}
                                        ${theme === 'dark-blue' ? 'bg-blue-950 border-blue-800' : ''}`}>
                                        {themes.map((t) => (
                                            <button
                                                key={t.name}
                                                onClick={() => changeTheme(t.name)}
                                                className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200
                                                    ${theme === t.name ? 'bg-blue-500 text-white' : 
                                                    `${theme === 'light' ? 'text-zinc-700 hover:bg-zinc-100' : ''}
                                                    ${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700' : ''}
                                                    ${theme === 'light-blue' ? 'text-blue-700 hover:bg-blue-100' : ''}
                                                    ${theme === 'dark-blue' ? 'text-blue-200 hover:bg-blue-800' : ''}`}`}>
                                                {React.createElement(t.icon, { className: `h-4 w-4 mr-2 text-${t.color}` })}
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                    <header className={`sticky top-0 z-40 backdrop-blur-md shadow-sm
                        ${theme === 'light' ? 'bg-white/90' : ''}
                        ${theme === 'dark' ? 'bg-zinc-800/90' : ''}
                        ${theme === 'light-blue' ? 'bg-blue-50/90' : ''}
                        ${theme === 'dark-blue' ? 'bg-blue-950/90' : ''}`}>
                        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    className={`lg:hidden p-2 rounded-lg focus:outline-none focus:ring-2
                                        ${theme === 'light' ? 'hover:bg-zinc-100 focus:ring-blue-500' : ''}
                                        ${theme === 'dark' ? 'hover:bg-zinc-700 focus:ring-blue-400' : ''}
                                        ${theme === 'light-blue' ? 'hover:bg-blue-100 focus:ring-blue-600' : ''}
                                        ${theme === 'dark-blue' ? 'hover:bg-blue-800 focus:ring-blue-300' : ''}`}
                                    onClick={() => setSidebarOpen(!sidebarOpen)}>
                                    <Menu className={`h-5 w-5
                                        ${theme === 'light' ? 'text-zinc-700' : ''}
                                        ${theme === 'dark' ? 'text-zinc-300' : ''}
                                        ${theme === 'light-blue' ? 'text-blue-700' : ''}
                                        ${theme === 'dark-blue' ? 'text-blue-200' : ''}`} />
                                </button>

                                <h1 className={`text-lg font-semibold hidden lg:block
                                    ${theme === 'light' ? 'text-zinc-800' : ''}
                                    ${theme === 'dark' ? 'text-white' : ''}
                                    ${theme === 'light-blue' ? 'text-blue-800' : ''}
                                    ${theme === 'dark-blue' ? 'text-blue-100' : ''}`}>
                                    {menuItems.find(item => item.route && isActive(item.route))?.name ||
                                        menuItems.find(item => item.submenu?.some(sub => isActive(sub.route)))?.name ||
                                        'Dashboard'}
                                </h1>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                                    className={`p-2 rounded-lg transition-colors hidden lg:block
                                        ${theme === 'light' ? 'hover:bg-zinc-100' : ''}
                                        ${theme === 'dark' ? 'hover:bg-zinc-700' : ''}
                                        ${theme === 'light-blue' ? 'hover:bg-blue-100' : ''}
                                        ${theme === 'dark-blue' ? 'hover:bg-blue-800' : ''}`}
                                    aria-label="Select theme">
                                    {themes.find(t => t.name === theme)?.icon && React.createElement(themes.find(t => t.name === theme).icon, {
                                        className: `h-5 w-5 text-${themes.find(t => t.name === theme).color}`
                                    })}
                                </button>

                                {/* <button className={`relative p-2 rounded-lg transition-all duration-200
                                    ${theme === 'light' ? 'hover:bg-zinc-100' : ''}
                                    ${theme === 'dark' ? 'hover:bg-zinc-700' : ''}
                                    ${theme === 'light-blue' ? 'hover:bg-blue-100' : ''}
                                    ${theme === 'dark-blue' ? 'hover:bg-blue-800' : ''}`}>
                                    <Bell className={`h-5 w-5
                                        ${theme === 'light' ? 'text-zinc-600' : ''}
                                        ${theme === 'dark' ? 'text-zinc-300' : ''}
                                        ${theme === 'light-blue' ? 'text-blue-600' : ''}
                                        ${theme === 'dark-blue' ? 'text-blue-200' : ''}`} />
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shadow-md">
                                        3
                                    </span>
                                </button> */}

                                <div className="relative group">
                                    <button className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300
                                        ${theme === 'light' ? 'hover:bg-zinc-100' : ''}
                                        ${theme === 'dark' ? 'hover:bg-zinc-700' : ''}
                                        ${theme === 'light-blue' ? 'hover:bg-blue-100' : ''}
                                        ${theme === 'dark-blue' ? 'hover:bg-blue-800' : ''}`}>
                                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-sm">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className={`hidden md:inline text-sm font-medium
                                            ${theme === 'light' ? 'text-zinc-800' : ''}
                                            ${theme === 'dark' ? 'text-white' : ''}
                                            ${theme === 'light-blue' ? 'text-blue-800' : ''}
                                            ${theme === 'dark-blue' ? 'text-blue-100' : ''}`}>
                                            {user?.name || 'User'}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 opacity-60
                                            ${theme === 'light' ? 'text-zinc-700' : ''}
                                            ${theme === 'dark' ? 'text-zinc-300' : ''}
                                            ${theme === 'light-blue' ? 'text-blue-700' : ''}
                                            ${theme === 'dark-blue' ? 'text-blue-200' : ''}`} />
                                    </button>

                                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2
                                        ${theme === 'light' ? 'bg-white border-zinc-100' : ''}
                                        ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                                        ${theme === 'light-blue' ? 'bg-blue-50 border-blue-200' : ''}
                                        ${theme === 'dark-blue' ? 'bg-blue-950 border-blue-800' : ''}`}>
                                        <div className={`p-3 border-b
                                            ${theme === 'light' ? 'border-zinc-100' : ''}
                                            ${theme === 'dark' ? 'border-zinc-700' : ''}
                                            ${theme === 'light-blue' ? 'border-blue-200' : ''}
                                            ${theme === 'dark-blue' ? 'border-blue-800' : ''}`}>
                                            <p className={`text-sm font-medium
                                                ${theme === 'light' ? 'text-zinc-800' : ''}
                                                ${theme === 'dark' ? 'text-white' : ''}
                                                ${theme === 'light-blue' ? 'text-blue-800' : ''}
                                                ${theme === 'dark-blue' ? 'text-blue-100' : ''}`}>
                                                {user?.name || 'User'}
                                            </p>
                                            <p className={`text-xs
                                                ${theme === 'light' ? 'text-zinc-500' : ''}
                                                ${theme === 'dark' ? 'text-zinc-400' : ''}
                                                ${theme === 'light-blue' ? 'text-blue-600' : ''}
                                                ${theme === 'dark-blue' ? 'text-blue-200' : ''}`}>
                                                {user?.email || 'user@example.com'}
                                            </p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                className={`flex items-center px-4 py-2 text-sm
                                                    ${theme === 'light' ? 'text-zinc-700 hover:bg-zinc-100' : ''}
                                                    ${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700' : ''}
                                                    ${theme === 'light-blue' ? 'text-blue-700 hover:bg-blue-100' : ''}
                                                    ${theme === 'dark-blue' ? 'text-blue-200 hover:bg-blue-800' : ''}`}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        );
    }