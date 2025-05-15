import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ auth, userRole, permissions, navigation, chatbotRules }) {
    const { flash } = usePage().props ?? {};
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ruleIdToDelete, setRuleIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State untuk pencarian
    const [sortOrder, setSortOrder] = useState('desc'); // State untuk filter terlama/terbaru

    useEffect(() => {
        if (flash) {
            if (flash.success) {
                setNotificationMessage(flash.success);
                setNotificationType('success');
                setShowNotification(true);
            } else if (flash.error) {
                setNotificationMessage(flash.error);
                setNotificationType('error');
                setShowNotification(true);
            }

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    const handleDeleteClick = (ruleId) => {
        setRuleIdToDelete(ruleId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (ruleIdToDelete) {
            setIsDeleting(true);
            router.post(
                route('admin.chatbot-rules.destroy', ruleIdToDelete),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onError: (errors) => {
                        setNotificationMessage(
                            'Gagal menghapus aturan chatbot: ' + (errors.error || 'Terjadi kesalahan.')
                        );
                        setNotificationType('error');
                        setShowNotification(true);
                        setIsDeleting(false);
                        setShowDeleteModal(false);
                        setRuleIdToDelete(null);
                    },
                    onSuccess: () => {
                        setNotificationMessage('Aturan chatbot berhasil dihapus!');
                        setNotificationType('success');
                        setShowNotification(true);
                        setIsDeleting(false);
                        setShowDeleteModal(false);
                        setRuleIdToDelete(null);
                    },
                    onFinish: () => {
                        setIsDeleting(false);
                    },
                }
            );
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setRuleIdToDelete(null);
    };

    // Fungsi untuk menyaring dan menyortir data
    const filteredChatbotRules = chatbotRules
        .filter((rule) =>
            [
                rule.keyword || '',
                rule.response || '',
            ].some((field) =>
                field.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Kelola Aturan Chatbot - Kemahasiswaan IT Del" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notificationType === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notificationType === 'success' ? (
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
                                    notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notificationMessage}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notificationType === 'success'
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

            {/* Modal Konfirmasi Hapus */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Konfirmasi Penghapusan</h3>
                        <p className="text-gray-600 text-center mb-6">
                            Apakah Anda yakin ingin menghapus aturan chatbot ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                disabled={isDeleting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                                disabled={isDeleting}
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Kelola Aturan Chatbot
                            </h1>
                            <p className="text-gray-500 mt-1">Kelola aturan untuk chatbot</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari aturan chatbot..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 transition-all duration-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <svg
                                    className="w-5 h-5 absolute left-3 top-3 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative w-full sm:w-40">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300"
                                >
                                    <option value="desc">Terbaru</option>
                                    <option value="asc">Terlama</option>
                                </select>
                                <svg
                                    className="w-5 h-5 absolute right-3 top-3 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>

                            {/* Add New Chatbot Rule Button */}
                            <Link
                                href={route('admin.chatbot-rules.create')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
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
                                Tambah Aturan Chatbot
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Chatbot Rules Table */}
                {filteredChatbotRules.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Kata Kunci
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Jawaban
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Dibuat Oleh
                                        </th>
                                        <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredChatbotRules.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-4 text-sm font-medium text-gray-900 max-w-[150px] break-words">
                                                {rule.keyword}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-600 max-w-[300px] break-words">
                                                {rule.response}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-600 max-w-[120px] break-words">
                                                {rule.user ? rule.user.username : 'Tidak diketahui'}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.chatbot-rules.edit', rule.id)}
                                                    className="text-blue-600 hover:text-blue-700 mr-2 transition"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(rule.id)}
                                                    className="text-red-600 hover:text-red-700 transition"
                                                    disabled={isDeleting}
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada aturan chatbot yang tersedia'}
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {searchQuery
                                ? 'Tidak ada aturan chatbot yang cocok dengan pencarian Anda.'
                                : 'Silakan tambahkan aturan chatbot baru untuk mulai mengatur respons otomatis.'}
                        </p>
                        {searchQuery ? (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Reset Pencarian
                            </button>
                        ) : (
                            <Link
                                href={route('admin.chatbot-rules.create')}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
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
                                Tambah Aturan Chatbot Baru
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Animation Styles */}
            <style>
                {`
                    @keyframes slide-in-right {
                        0% {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        100% {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    .animate-slide-in-right {
                        animation: slide-in-right 0.5s ease-out forwards;
                    }
                `}
            </style>
        </AdminLayout>
    );
}