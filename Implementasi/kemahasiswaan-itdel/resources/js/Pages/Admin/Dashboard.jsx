import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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

    useEffect(() => {
        console.log('User info:', auth.user);
    }, [auth.user]);

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-4 text-2xl font-semibold">
                                Selamat Datang, {getGreeting()}
                            </h1>

                            <div className="mb-6 mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="rounded-lg bg-blue-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-blue-800">
                                        Total Mahasiswa
                                    </h3>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {totalMahasiswa}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-green-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-green-800">
                                        Kegiatan Aktif
                                    </h3>
                                    <p className="text-3xl font-bold text-green-600">15</p>
                                </div>

                                <div className="rounded-lg bg-purple-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-purple-800">
                                        Pengumuman
                                    </h3>
                                    <p className="text-3xl font-bold text-purple-600">8</p>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Fitur yang Tersedia:
                                </h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {menu
                                        .filter((item) => item.name !== 'Dashboard')
                                        .map((item, index) => (
                                            <Link
                                                key={index}
                                                href={route(item.route)}
                                                className="flex items-center rounded-lg bg-gray-50 p-4 shadow-sm transition-colors duration-200 hover:bg-gray-100"
                                            >
                                                <div className="mr-4 rounded-full bg-blue-500 p-3 text-white">
                                                    <i className={`fas fa-${item.icon}`}></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{item.name}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Kelola {item.name}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
