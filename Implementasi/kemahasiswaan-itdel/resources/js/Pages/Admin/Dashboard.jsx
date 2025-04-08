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
    Heart
} from 'lucide-react';

export default function Dashboard({ auth, userRole, permissions, menu, totalMahasiswa }) {
    // Tambahkan salam berdasarkan peran pengguna
    const getGreeting = () => {
        switch (userRole) {
            case 'kemahasiswaan':
                return 'Kemahasiswaan';
            case 'adminbem':
                return 'Admin BEM';
            case 'adminmpm':
                return 'Admin MPM';
            default:
                return userRole;
        }
    };

    // Icon mapping dari RoleHelper ke lucide-react
    const iconMap = {
        home: LayoutDashboard,
        bell: Bell,
        gear: Settings,
        calendar: Calendar,
        organization: Users,
        newspaper: Newspaper,
        award: Award,
        heart: Heart
    };

    useEffect(() => {
        console.log('User info:', auth.user);
    }, [auth.user]);

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>

            <Head title="Admin Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header dengan Glass Effect */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Selamat Datang, {getGreeting()}
                        </h1>
                        <p className="text-gray-500 mt-1">Kelola semua aktivitas kemahasiswaan di sini</p>
                    </div>

                    {/* Statistik */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="group rounded-xl bg-blue-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-blue-100 hover:-translate-y-1">
                            <h3 className="mb-2 text-lg font-medium text-blue-800">
                                Total Mahasiswa
                            </h3>
                            <p className="text-3xl font-bold text-blue-600">
                                {totalMahasiswa}
                            </p>
                        </div>

                        <div className="group rounded-xl bg-green-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-green-100 hover:-translate-y-1">
                            <h3 className="mb-2 text-lg font-medium text-green-800">
                                Kegiatan Aktif
                            </h3>
                            <p className="text-3xl font-bold text-green-600">15</p>
                        </div>

                        <div className="group rounded-xl bg-purple-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-purple-100 hover:-translate-y-1">
                            <h3 className="mb-2 text-lg font-medium text-purple-800">
                                Pengumuman
                            </h3>
                            <p className="text-3xl font-bold text-purple-600">8</p>
                        </div>
                    </div>

                    {/* Fitur yang Tersedia */}
                    <div className="mt-10">
                        <h2 className="mb-4 text-xl font-semibold text-gray-800">
                            Fitur yang Tersedia:
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {menu
                                .filter((item) => item.name !== 'Dashboard')
                                .map((item, index) => (
                                    <Link
                                        key={index}
                                        href={route(item.route)}
                                        className="group flex items-center rounded-xl bg-gray-50 p-4 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md hover:-translate-y-1"
                                    >
                                        <div className="mr-4 rounded-full bg-blue-500 p-3 text-white">
                                            {item.icon && iconMap[item.icon] ? (
                                                React.createElement(iconMap[item.icon], {
                                                    className: 'h-5 w-5'
                                                })
                                            ) : (
                                                <LayoutDashboard className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Kelola {item.name.toLowerCase()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}