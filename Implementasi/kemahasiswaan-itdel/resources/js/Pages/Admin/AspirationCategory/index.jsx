import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Index({ auth, userRole, permissions, menu, categories, flash }) {
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        // Handle flash messages from server
        if (flash) {
            if (flash.success) {
                setNotification({
                    show: true,
                    type: 'success',
                    message: flash.success,
                });
            } else if (flash.error) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: flash.error,
                });
            }
        }

        // Auto-hide notification after 5 seconds
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash, notification]);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            router.post(route('admin.aspiration-category.destroy', id), {}, {
                onSuccess: () => {
                    setNotification({
                        show: true,
                        type: 'success',
                        message: 'Kategori berhasil dihapus!',
                    });
                },
                onError: (errors) => {
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal menghapus kategori: ' + (errors.error || 'Terjadi kesalahan.'),
                    });
                },
            });
        }
    };

    // Prepare data for the bar chart
    const chartData = {
        labels: categories.map(category => category.name), // Category names as labels
        datasets: [
            {
                label: 'Jumlah Aspirasi',
                data: categories.map(category => category.aspirations?.length || 0), // Number of aspirations per category
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue color with opacity
                borderColor: 'rgba(54, 162, 235, 1)', // Solid blue border
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Statistik Jumlah Aspirasi per Kategori',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Jumlah Aspirasi',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Kategori',
                },
            },
        },
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Kelola Kategori Aspirasi" />

            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notification.type === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notification.type === 'success' ? (
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                ) : (
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V5z"
                                        clipRule="evenodd"
                                    />
                                )}
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p
                                className={`text-sm font-medium ${
                                    notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notification.type === 'success'
                                        ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                                        : 'text-rose-500 hover:bg-rose-100 focus:ring-rose-500'
                                } focus:outline-none focus:ring-2`}
                            >
                                <span className="sr-only">Dismiss</span>
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Kelola Kategori Aspirasi
                        </h1>
                        <p className="text-gray-500 mt-1">Daftar semua kategori aspirasi</p>
                    </div>
                    <Link
                        href={route('admin.aspiration-category.create')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                        Tambah Kategori
                    </Link>
                </div>

                {/* Bar Chart for Aspiration Statistics */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Aspirasi per Kategori</h2>
                    {categories.length > 0 ? (
                        <div className="w-full">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Tidak ada data untuk ditampilkan.</p>
                    )}
                </div>

                {/* Table of Categories */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    {categories.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Kategori
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jumlah Aspirasi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category, index) => (
                                        <tr key={category.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {category.aspirations?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={route('admin.aspiration-category.edit', category.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Tidak ada kategori aspirasi yang tersedia.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}