import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

export default function DownloadIndex({ auth, userRole, permissions, navigation, downloads, success }) {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);

    useEffect(() => {
        if (success) {
            setNotificationMessage({ type: 'success', message: success });
            setShowNotification(true);

            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus file ini?')) {
            router.post(route('admin.downloads.destroy', id));
        }
    };

    const handleDownload = (filePath) => {
        window.open(`/storage/${filePath}`, '_blank');
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={navigation}
        >
            <Head title="Kelola Unduhan" />

            {showNotification && notificationMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notificationMessage.type === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notificationMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notificationMessage.type === 'success' ? (
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
                                    notificationMessage.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notificationMessage.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notificationMessage.type === 'success'
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
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Kelola Unduhan
                            </h1>
                            <p className="text-gray-500 mt-1">Kelola file unduhan untuk diakses pengguna</p>
                        </div>
                        <Link
                            href={route('admin.downloads.create')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Tambah File
                        </Link>
                    </div>
                </div>

                {downloads.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Judul
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Deskripsi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Dibuat Oleh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Download
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {downloads.map((download) => (
                                    <tr key={download.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs break-words">
                                            {download.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs break-words">
                                            {download.category ? download.category.name : 'Tidak ada kategori'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs break-words">
                                            {download.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs break-words">
                                            {download.creator ? download.creator.name : 'Tidak diketahui'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <button
                                                onClick={() => handleDownload(download.file_path)}
                                                className="text-green-600 hover:text-green-700 transition flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                    />
                                                </svg>
                                                Unduh
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('admin.downloads.edit', download.id)}
                                                className="text-blue-600 hover:text-blue-700 mr-4 transition"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(download.id)}
                                                className="text-red-600 hover:text-red-700 transition"
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
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m-3 6h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Tidak ada file unduhan yang tersedia
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            Silakan tambahkan file baru untuk memulai.
                        </p>
                        <Link
                            href={route('admin.downloads.create')}
                            className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center shadow-md"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Tambah File Baru
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}