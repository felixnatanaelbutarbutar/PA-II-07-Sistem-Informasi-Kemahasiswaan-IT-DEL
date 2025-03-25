import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function KemahasiswaanDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    // Sample data for charts and stats
    const studentStats = [
        {
            label: 'Total Mahasiswa',
            value: '3,240',
            icon: 'users',
            color: 'blue',
        },
        {
            label: 'Mahasiswa Aktif',
            value: '3,180',
            icon: 'user-check',
            color: 'green',
        },
        {
            label: 'Mahasiswa Cuti',
            value: '42',
            icon: 'user-minus',
            color: 'yellow',
        },
        { label: 'Mahasiswa DO', value: '18', icon: 'user-x', color: 'red' },
    ];

    const recentActivities = [
        {
            id: 1,
            title: 'Pendaftaran Beasiswa Dibuka',
            date: '2 jam yang lalu',
            type: 'info',
        },
        {
            id: 2,
            title: 'Pengajuan Cuti Semester Ganjil',
            date: '1 hari yang lalu',
            type: 'warning',
        },
        {
            id: 3,
            title: 'Pengumuman Penerima Beasiswa',
            date: '3 hari yang lalu',
            type: 'success',
        },
        {
            id: 4,
            title: 'Batas Akhir Pembayaran UKT',
            date: '1 minggu yang lalu',
            type: 'danger',
        },
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Rapat Koordinasi Kemahasiswaan',
            date: '24 Maret 2025',
            location: 'Ruang Rapat Utama',
        },
        {
            id: 2,
            title: 'Workshop Pengembangan Karir',
            date: '28 Maret 2025',
            location: 'Auditorium',
        },
        {
            id: 3,
            title: 'Seminar Kewirausahaan',
            date: '2 April 2025',
            location: 'Aula Gedung A',
        },
    ];

    return (
        <AdminLayout title="Dashboard Kemahasiswaan">
            <Head title="Dashboard Kemahasiswaan" />

            {/* Dashboard Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                            activeTab === 'students'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                        Mahasiswa
                    </button>
                    <button
                        onClick={() => setActiveTab('scholarships')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                            activeTab === 'scholarships'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                        Beasiswa
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                            activeTab === 'activities'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                        Kegiatan
                    </button>
                </nav>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {studentStats.map((stat, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-lg bg-white shadow"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div
                                    className={`flex-shrink-0 rounded-md bg-${stat.color}-100 p-3`}
                                >
                                    <svg
                                        className={`h-6 w-6 text-${stat.color}-600`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        {stat.icon === 'users' && (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        )}
                                        {stat.icon === 'user-check' && (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        )}
                                        {stat.icon === 'user-minus' && (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                                            />
                                        )}
                                        {stat.icon === 'user-x' && (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12l-6 6m0-6l6 6"
                                            />
                                        )}
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">
                                            {stat.label}
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">
                                                {stat.value}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Activities */}
                <div className="overflow-hidden rounded-lg bg-white shadow lg:col-span-2">
                    <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Aktivitas Terbaru
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flow-root">
                            <ul className="-mb-8">
                                {recentActivities.map((activity, index) => (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                            {index !==
                                                recentActivities.length - 1 && (
                                                <span
                                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"
                                                ></span>
                                            )}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                            activity.type ===
                                                            'info'
                                                                ? 'bg-blue-100'
                                                                : activity.type ===
                                                                    'warning'
                                                                  ? 'bg-yellow-100'
                                                                  : activity.type ===
                                                                      'success'
                                                                    ? 'bg-green-100'
                                                                    : 'bg-red-100'
                                                        }`}
                                                    >
                                                        <svg
                                                            className={`h-5 w-5 ${
                                                                activity.type ===
                                                                'info'
                                                                    ? 'text-blue-600'
                                                                    : activity.type ===
                                                                        'warning'
                                                                      ? 'text-yellow-600'
                                                                      : activity.type ===
                                                                          'success'
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600'
                                                            }`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            {activity.type ===
                                                                'info' && (
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            )}
                                                            {activity.type ===
                                                                'warning' && (
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                                />
                                                            )}
                                                            {activity.type ===
                                                                'success' && (
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            )}
                                                            {activity.type ===
                                                                'danger' && (
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            )}
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {activity.date}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-6">
                            <a
                                href="#"
                                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Lihat Semua
                            </a>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Agenda Mendatang
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="space-y-4">
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-6 w-6 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-base font-medium text-gray-900">
                                                {event.title}
                                            </h4>
                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                                <span>{event.date}</span>
                                                <span className="mx-1">•</span>
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <a
                                href="#"
                                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Lihat Semua Agenda
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Aksi Cepat
                    </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
                            <svg
                                className="mb-2 h-8 w-8 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">
                                Buat Pengumuman
                            </span>
                        </button>
                        <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
                            <svg
                                className="mb-2 h-8 w-8 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">
                                Kelola Beasiswa
                            </span>
                        </button>
                        <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
                            <svg
                                className="mb-2 h-8 w-8 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">
                                Tambah Kegiatan
                            </span>
                        </button>
                        <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
                            <svg
                                className="mb-2 h-8 w-8 text-yellow-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">
                                Data Mahasiswa
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
