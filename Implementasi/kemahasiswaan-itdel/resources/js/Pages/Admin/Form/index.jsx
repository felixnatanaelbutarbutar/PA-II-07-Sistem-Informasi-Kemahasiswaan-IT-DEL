import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 text-red-800 rounded-lg">
                    <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
                    <p>Maaf, ada masalah saat memuat halaman: {this.state.error?.message || 'Silakan coba lagi.'}</p>
                    <Link
                        href="/admin/form"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Kembali ke Daftar
                    </Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Index({ auth, userRole, permissions, menu, forms = [], scholarships = [], flash, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formIdToDelete, setFormIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGridView, setIsGridView] = useState(true);

    useEffect(() => {
        if (flash?.success) {
            setNotificationMessage(flash.success);
            setNotificationType('success');
            setShowNotification(true);
        } else if (flash?.error) {
            setNotificationMessage(flash.error);
            setNotificationType('error');
            setShowNotification(true);
        }

        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('admin.form.index'),
                { search: searchTerm, status: selectedStatus },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedStatus]);

    const handleDeleteClick = (form_id) => {
        setFormIdToDelete(form_id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!formIdToDelete) return;
        setIsDeleting(true);
        router.delete(route('admin.form.destroy', formIdToDelete), {
            preserveState: true,
            preserveScroll: true,
            onError: (errors) => {
                setNotificationMessage('Gagal menghapus formulir: ' + (errors.error || 'Terjadi kesalahan.'));
                setNotificationType('error');
                setShowNotification(true);
                setIsDeleting(false);
                setShowDeleteModal(false);
                setFormIdToDelete(null);
            },
            onSuccess: () => {
                setNotificationMessage('Formulir berhasil dihapus!');
                setNotificationType('success');
                setShowNotification(true);
                setIsDeleting(false);
                setShowDeleteModal(false);
                setFormIdToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFormIdToDelete(null);
    };

    const handleToggleFormActive = (form_id, is_active) => {
        router.post(
            route('admin.form.toggleActive', form_id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => {
                    setNotificationMessage('Gagal mengubah status formulir: ' + (errors.error || 'Terjadi kesalahan.'));
                    setNotificationType('error');
                    setShowNotification(true);
                },
                onSuccess: () => {
                    setNotificationMessage(is_active ? 'Formulir berhasil dinonaktifkan!' : 'Formulir berhasil diaktifkan!');
                    setNotificationType('success');
                    setShowNotification(true);
                },
            }
        );
    };

    return (
        <ErrorBoundary>
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title="Kelola Formulir Beasiswa" />

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
                                    className={`h-5 w-5 ${notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
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

                {/* Delete Confirmation Modal */}
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
                                Apakah Anda yakin ingin menghapus formulir ini? Tindakan ini tidak dapat dibatalkan.
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

                <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Manajemen Formulir Beasiswa
                                </h1>
                                <p className="text-gray-500 mt-1">Kelola formulir untuk program beasiswa</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                    <input
                                        type="text"
                                        placeholder="Cari formulir, deskripsi, atau beasiswa..."
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <svg
                                        className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
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
                                <div className="relative">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full md:w-40 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Non-Aktif</option>
                                    </select>
                                </div>
                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setIsGridView(true)}
                                        className={`p-1.5 rounded ${
                                            isGridView ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
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
                                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setIsGridView(false)}
                                        className={`p-1.5 rounded ${
                                            !isGridView ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
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
                                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <Link
                                    href={route('admin.form.create')}
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
                                    Tambah Formulir
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Grid View */}
                    {isGridView ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {forms.map((form) => (
                                <div
                                    key={form.form_id}
                                    className="group bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-blue-200 hover:translate-y-[-4px]"
                                >
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition mb-2">
                                            {form.form_name || '-'}
                                        </h2>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{form.description || '-'}</p>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Beasiswa:</span>{' '}
                                            {form.scholarship_name || '-'}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Dibuat Oleh:</span>{' '}
                                            {form.created_by || '-'}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Tanggal Buka:</span>{' '}
                                            {form.open_date || '-'}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3">
                                            <span className="font-medium">Tanggal Tutup:</span>{' '}
                                            {form.close_date || '-'}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3">
                                            <span className="font-medium">Status:</span>{' '}
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                    form.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {form.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-100">
                                            <Link
                                                href={route('admin.form.edit', form.form_id)}
                                                className="flex items-center text-blue-600 hover:text-blue-700 transition group-hover:scale-105 px-2 py-1 rounded-md hover:bg-blue-50"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                                Edit
                                            </Link>
                                            <Link
                                                href={route('admin.form.settings', form.form_id)}
                                                className="flex items-center text-green-600 hover:text-green-700 transition group-hover:scale-105 px-2 py-1 rounded-md hover:bg-green-50"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                                    />
                                                </svg>
                                                Pengaturan
                                            </Link>
                                            <button
                                                onClick={() => handleToggleFormActive(form.form_id, form.is_active)}
                                                className={`flex items-center ${
                                                    form.is_active
                                                        ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                                                        : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                                                } transition group-hover:scale-105 px-2 py-1 rounded-md`}
                                                disabled={isDeleting}
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    {form.is_active ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    )}
                                                </svg>
                                                {form.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(form.form_id)}
                                                className="flex items-center text-red-600 hover:text-red-700 transition group-hover:scale-105 px-2 py-1 rounded-md hover:bg-red-50"
                                                disabled={isDeleting}
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-1"
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
                                                Hapus
                                            </button>
                                            <Link
                                                href={route('admin.form.show', form.form_id)}
                                                className="flex items-center text-purple-600 hover:text-purple-700 transition group-hover:scale-105 px-2 py-1 rounded-md hover:bg-purple-50"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                                Lihat Form
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Formulir
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deskripsi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Beasiswa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dibuat Oleh
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Buka
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Tutup
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {forms.map((form) => (
                                        <tr key={form.form_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {form.form_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {form.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.scholarship_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.created_by || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.open_date || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.close_date || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                        form.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {form.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[250px]">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('admin.form.edit', form.form_id)}
                                                        className="text-blue-600 hover:text-blue-700 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <Link
                                                        href={route('admin.form.settings', form.form_id)}
                                                        className="text-green-600 hover:text-green-700 transition"
                                                    >
                                                        Pengaturan
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleFormActive(form.form_id, form.is_active)}
                                                        className={`${
                                                            form.is_active
                                                                ? 'text-yellow-600 hover:text-yellow-700'
                                                                : 'text-teal-600 hover:text-teal-700'
                                                        } transition`}
                                                        disabled={isDeleting}
                                                    >
                                                        {form.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(form.form_id)}
                                                        className="text-red-600 hover:text-red-700 transition"
                                                        disabled={isDeleting}
                                                    >
                                                        Hapus
                                                    </button>
                                                    <Link
                                                        href={route('admin.form.show', form.form_id)}
                                                        className="text-purple-600 hover:text-purple-700 transition"
                                                    >
                                                        Lihat Form
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty State */}
                    {forms.length === 0 && (
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada formulir yang tersedia</h3>
                            <p className="text-gray-500 text-center max-w-md mb-6">
                                {searchTerm
                                    ? 'Tidak ada hasil yang cocok dengan pencarian Anda.'
                                    : selectedStatus !== 'all'
                                    ? `Tidak ada formulir dengan status ${selectedStatus === 'active' ? 'Aktif' : 'Non-Aktif'}.`
                                    : 'Belum ada formulir beasiswa yang dibuat. Mulai dengan membuat formulir baru.'}
                            </p>
                            {searchTerm ? (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Reset Pencarian
                                </button>
                            ) : (
                                <Link
                                    href={route('admin.form.create')}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
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
                                    Buat Formulir Baru
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ErrorBoundary>
    );
}
