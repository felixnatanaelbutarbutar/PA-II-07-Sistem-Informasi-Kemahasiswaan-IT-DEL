import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    LayoutDashboard,
    Bell,
    Settings,
    Calendar,
    Users,
    Newspaper,
    Award,
    Heart,
    BookOpen,
    Download,
    MessageSquare,
    Image,
} from 'lucide-react';

export default function Dashboard({ auth, userRole, permissions, menu, totalMahasiswa }) {
    // Icon mapping dari RoleHelper ke lucide-react, disesuaikan dengan AdminLayout
    const iconMap = {
        home: LayoutDashboard,
        bell: Bell,
        gear: Settings,
        calendar: Calendar,
        organization: Users,
        newspaper: Newspaper,
        award: Award,
        heart: Heart,
        scholarship: BookOpen,
        download: Download,
        aspiration: MessageSquare,
        carousel: Image,
    };

    useEffect(() => {
        console.log('User info:', auth.user);
    }, [auth.user]);

    // Fungsi untuk memeriksa apakah rute valid
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

    // Fungsi untuk mendapatkan route yang dapat digunakan untuk link
    const getLinkRoute = (item) => {
        // Jika item memiliki route langsung dan valid
        if (item.route && isRouteValid(item.route)) {
            return item.route;
        }
        // Jika item memiliki submenu, gunakan route dari submenu pertama yang valid
        if (item.submenu && item.submenu.length > 0) {
            const validSubItem = item.submenu.find(subItem => subItem.route && isRouteValid(subItem.route));
            return validSubItem ? validSubItem.route : null;
        }
        return null;
    };

    // Daftar warna untuk setiap fitur (untuk variasi visual)
    const featureColors = [
        { bg: 'bg-blue-50', hoverBg: 'bg-blue-100', text: 'text-blue-800', accent: 'bg-blue-500', hoverText: 'text-blue-600' },
        { bg: 'bg-green-50', hoverBg: 'bg-green-100', text: 'text-green-800', accent: 'bg-green-500', hoverText: 'text-green-600' },
        { bg: 'bg-purple-50', hoverBg: 'bg-purple-100', text: 'text-purple-800', accent: 'bg-purple-500', hoverText: 'text-purple-600' },
        { bg: 'bg-yellow-50', hoverBg: 'bg-yellow-100', text: 'text-yellow-800', accent: 'bg-yellow-500', hoverText: 'text-yellow-600' },
        { bg: 'bg-red-50', hoverBg: 'bg-red-100', text: 'text-red-800', accent: 'bg-red-500', hoverText: 'text-red-600' },
        { bg: 'bg-indigo-50', hoverBg: 'bg-indigo-100', text: 'text-indigo-800', accent: 'bg-indigo-500', hoverText: 'text-indigo-600' },
    ];

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Admin Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header dengan Glass Effect */}
                    <div className={`backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border
                        ${document.documentElement.classList.contains('light') ? 'bg-white/80 border-gray-200/50' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800/80 border-zinc-700/50' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50/80 border-blue-200/50' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950/80 border-blue-800/50' : ''}`}>
                        <h1 className={`text-3xl font-bold bg-clip-text text-transparent
                            ${document.documentElement.classList.contains('light') ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-gradient-to-r from-blue-300 to-indigo-400' : ''}`}>
                            Selamat Datang, {auth.user.name || 'User'}
                        </h1>
                        <p className={`mt-1
                            ${document.documentElement.classList.contains('light') ? 'text-gray-500' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                            Kelola semua aktivitas kemahasiswaan di sini
                        </p>
                    </div>

                    {/* Statistik */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className={`group rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                            ${document.documentElement.classList.contains('light') ? 'bg-blue-50 hover:bg-blue-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-blue-900/30 hover:bg-blue-900/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100 hover:bg-blue-200' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 hover:bg-blue-700' : ''}`}>
                            <h3 className={`mb-2 text-lg font-medium
                                ${document.documentElement.classList.contains('light') ? 'text-blue-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-blue-300' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-900' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                Total Mahasiswa
                            </h3>
                            <p className={`text-3xl font-bold
                                ${document.documentElement.classList.contains('light') ? 'text-blue-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-blue-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                {totalMahasiswa}
                            </p>
                        </div>

                        <div className={`group rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                            ${document.documentElement.classList.contains('light') ? 'bg-green-50 hover:bg-green-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-green-900/30 hover:bg-green-900/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-green-100 hover:bg-green-200' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-green-800 hover:bg-green-700' : ''}`}>
                            <h3 className={`mb-2 text-lg font-medium
                                ${document.documentElement.classList.contains('light') ? 'text-green-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-green-300' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-green-900' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-green-200' : ''}`}>
                                Kegiatan Aktif
                            </h3>
                            <p className={`text-3xl font-bold
                                ${document.documentElement.classList.contains('light') ? 'text-green-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-green-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-green-700' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-green-100' : ''}`}>
                                15
                            </p>
                        </div>

                        <div className={`group rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                            ${document.documentElement.classList.contains('light') ? 'bg-purple-50 hover:bg-purple-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-purple-900/30 hover:bg-purple-900/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-purple-100 hover:bg-purple-200' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-purple-800 hover:bg-purple-700' : ''}`}>
                            <h3 className={`mb-2 text-lg font-medium
                                ${document.documentElement.classList.contains('light') ? 'text-purple-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-purple-300' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-purple-900' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-purple-200' : ''}`}>
                                Pengumuman
                            </h3>
                            <p className={`text-3xl font-bold
                                ${document.documentElement.classList.contains('light') ? 'text-purple-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-purple-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-purple-700' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-purple-100' : ''}`}>
                                8
                            </p>
                        </div>
                    </div>

                    {/* Fitur yang Tersedia */}
                    <div className="mt-10">
                        <h2 className={`mb-4 text-xl font-semibold
                            ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                            Fitur yang Tersedia:
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {menu
                                .filter((item) => item.name !== 'Dashboard')
                                .map((item, index) => {
                                    const linkRoute = getLinkRoute(item);
                                    if (!linkRoute) {
                                        console.warn(`Skipping menu item "${item.name}" in Dashboard due to invalid or missing route.`);
                                        return null;
                                    }

                                    const color = featureColors[index % featureColors.length];

                                    return (
                                        <Link
                                            key={index}
                                            href={route(linkRoute)}
                                            className={`group flex items-center rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border
                                                ${document.documentElement.classList.contains('light') ? `${color.bg} hover:${color.hoverBg} border-gray-200/50` : ''}
                                                ${document.documentElement.classList.contains('dark') ? `bg-opacity-30 hover:bg-opacity-50 border-zinc-700/50 ${color.bg.replace('50', '900')}` : ''}
                                                ${document.documentElement.classList.contains('light-blue') ? `bg-blue-50 hover:bg-blue-100 border-blue-200/50` : ''}
                                                ${document.documentElement.classList.contains('dark-blue') ? `bg-blue-800 hover:bg-blue-700 border-blue-800/50` : ''}`}>
                                            <div className={`mr-4 rounded-full p-3 text-white transition-all duration-300 ${color.accent} group-hover:scale-110`}>
                                                {item.icon && iconMap[item.icon] ? (
                                                    React.createElement(iconMap[item.icon], {
                                                        className: 'h-6 w-6',
                                                    })
                                                ) : (
                                                    <LayoutDashboard className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-medium transition-colors duration-300
                                                    ${document.documentElement.classList.contains('light') ? `${color.text} group-hover:${color.hoverText}` : ''}
                                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-200 group-hover:text-blue-400' : ''}
                                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800 group-hover:text-blue-600' : ''}
                                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100 group-hover:text-blue-300' : ''}`}>
                                                    {item.name}
                                                </h3>
                                                <p className={`text-sm
                                                    ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                                    Kelola {item.name.toLowerCase()}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}