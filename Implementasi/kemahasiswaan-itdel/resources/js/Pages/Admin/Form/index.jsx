import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import moment from 'moment';

// Main component for managing scholarship forms
export default function Index({ auth, userRole, permissions, menu, forms = [], scholarships = [], filters = {}, flash }) {
    // State for search, filters, sorting, notifications, delete modal, and dropdown
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'form_name');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Create refs for each dropdown
    const dropdownRefs = useRef({});

    // Handle flash messages for success/error notifications
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
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Handle click outside to close dropdown and Escape key press
    useEffect(() => {
        const handleClickOutside = (event) => {
            let isOutside = true;
            Object.values(dropdownRefs.current).forEach((ref) => {
                if (ref && ref.contains(event.target)) {
                    isOutside = false;
                }
            });
            if (isOutside) {
                setOpenDropdownId(null);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Debounce search and filter updates to refresh the table
    useEffect(() => {
        const timer = setTimeout(() => {
            const queryParams = {
                search: searchTerm.trim() || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                sort_by: sortBy || undefined,
                sort_direction: sortDirection || undefined,
            };

            router.get(
                route('admin.form.index'),
                queryParams,
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, sortBy, sortDirection]);

    // Handle initiating form deletion
    const handleDeleteClick = (form) => {
        if (!form?.form_id) {
            setNotificationMessage('Gagal: ID Formulir tidak valid.');
            setNotificationType('error');
            setShowNotification(true);
            return;
        }
        setFormToDelete(form);
        setShowDeleteModal(true);
        setOpenDropdownId(null); // Close dropdown after action
    };

    // Confirm and perform form deletion
    const confirmDelete = () => {
        if (!formToDelete?.form_id) {
            setNotificationMessage('Gagal: ID Formulir tidak valid.');
            setNotificationType('error');
            setShowNotification(true);
            setShowDeleteModal(false);
            setFormToDelete(null);
            return;
        }

        setIsDeleting(true);
        router.post(route('admin.form.destroy', formToDelete.form_id), {}, {
            preserveState: true,
            preserveScroll: true,
            onError: (errors) => {
                setNotificationMessage('Gagal menghapus formulir: ' + (errors.error || 'Terjadi kesalahan.'));
                setNotificationType('error');
                setShowNotification(true);
                setIsDeleting(false);
                setShowDeleteModal(false);
                setFormToDelete(null);
            },
            onSuccess: () => {
                setNotificationMessage('Formulir berhasil dihapus!');
                setNotificationType('success');
                setShowNotification(true);
                setIsDeleting(false);
                setShowDeleteModal(false);
                setFormToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Cancel deletion
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFormToDelete(null);
    };

    // Handle table sorting
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    // Refresh the form list
    const handleRefresh = () => {
        router.get(route('admin.form.index'), {}, {
            preserveState: false,
            preserveScroll: false,
            replace: false,
        });
    };

    // Toggle dropdown visibility
    const toggleDropdown = (formId) => {
        setOpenDropdownId(openDropdownId === formId ? null : formId);
    };

    // Calculate fixed position for table view dropdown (below the button)
    const getTableDropdownPosition = (formId) => {
        const button = document.querySelector(`[data-form-id="${formId}"]`);
        if (!button) return { top: 0, left: 0 };

        const rect = button.getBoundingClientRect();
        const dropdownHeight = 150; // Approximate dropdown height in pixels
        const dropdownWidth = 192; // Approximate w-48 in pixels
        const spaceBelow = window.innerHeight - rect.bottom;
        const viewportWidth = window.innerWidth;

        // Position below the button
        let top = rect.bottom + 8; // 8px gap below the button
        let left = rect.right - dropdownWidth; // Align right edge of dropdown with right edge of button

        // Adjust if dropdown would go off the bottom of the viewport
        if (top + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - 8; // Fallback to above the button if not enough space below
        }

        // Adjust if dropdown would go off the left or right of the viewport
        if (left < 0) {
            left = 8; // Align with left edge of viewport with 8px padding
        } else if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 8; // Align with right edge of viewport with 8px padding
        }

        return { top, left };
    };

    // Calculate fixed position for grid view dropdown
    const getGridDropdownPosition = (formId) => {
        const button = document.querySelector(`[data-form-id="${formId}"]`);
        if (!button) return { top: 0, left: 0 };

        const rect = button.getBoundingClientRect();
        const dropdownHeight = 150; // Approximate dropdown height in pixels
        const dropdownWidth = 192; // Approximate w-48 in pixels
        const spaceAbove = rect.top;
        const viewportWidth = window.innerWidth;

        // Position above the button
        let top = rect.top - dropdownHeight - 8; // 8px gap above the button
        let left = rect.right - dropdownWidth; // Align right edge of dropdown with right edge of button

        // Adjust if dropdown would go off the top of the viewport
        if (top < 0) {
            top = rect.bottom + 8; // Fallback to below the button if not enough space above
        }

        // Adjust if dropdown would go off the left or right of the viewport
        if (left < 0) {
            left = 8; // Align with left edge of viewport with 8px padding
        } else if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 8; // Align with right edge of viewport with 8px padding
        }

        return { top, left };
    };

    // Filter forms based on search and status
    const filteredForms = forms.filter((form) => {
        if (!form) return false;
        const matchesSearch =
            (form.form_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (form.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (form.scholarship_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (form.created_by || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && form.is_active) ||
            (statusFilter === 'inactive' && !form.is_active);
        return matchesSearch && matchesStatus;
    });

    return (
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
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                            <p className="text-gray-500 mt-1">Kelola formulir beasiswa untuk website</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari nama formulir, deskripsi, atau beasiswa..."
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
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none w-48 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 pr-8"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Non-Aktif</option>
                                </select>
                                <svg
                                    className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
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
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-md ${
                                        viewMode === 'table'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    } transition-all duration-200`}
                                    title="Tampilan Tabel"
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
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md ${
                                        viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    } transition-all duration-200`}
                                    title="Tampilan Grid"
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
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center"
                                title="Segarkan daftar formulir"
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
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Segarkan
                            </button>
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

                {/* Table View */}
                {viewMode === 'table' && filteredForms.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('form_name')}
                                    >
                                        Nama Formulir
                                        {sortBy === 'form_name' && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('scholarship_name')}
                                    >
                                        Beasiswa
                                        {sortBy === 'scholarship_name' && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('start_date')}
                                    >
                                        Tanggal Buka
                                        {sortBy === 'start_date' && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('close_date')}
                                    >
                                        Tanggal Tutup
                                        {sortBy === 'close_date' && (
                                            <span>{sortDirection === 'asc' ? '↓' : '↑'}</span>
                                        )}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dibuat Oleh
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredForms.map((form, index) => {
                                    const dropdownPosition = openDropdownId === form.form_id ? getTableDropdownPosition(form.form_id) : { top: 0, left: 0 };
                                    return (
                                        <tr key={form.form_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {form.form_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.scholarship_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.start_date !== '-' ? moment(form.start_date).format('DD MMM YYYY HH:mm') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.close_date !== '-' ? moment(form.close_date).format('DD MMM YYYY HH:mm') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        form.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {form.status || (form.is_active ? 'Aktif' : 'Non-Aktif')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {form.created_by || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div
                                                    className="relative"
                                                    ref={(el) => (dropdownRefs.current[form.form_id] = el)}
                                                >
                                                    <button
                                                        onClick={() => toggleDropdown(form.form_id)}
                                                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition focus:outline-none"
                                                        aria-label="More actions"
                                                        aria-expanded={openDropdownId === form.form_id}
                                                        disabled={isDeleting}
                                                        data-form-id={form.form_id}
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
                                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    {openDropdownId === form.form_id && (
                                                        <div
                                                            className="fixed w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                                                            style={{
                                                                top: `${dropdownPosition.top}px`,
                                                                left: `${dropdownPosition.left}px`,
                                                            }}
                                                        >
                                                            <div className="py-1">
                                                                <Link
                                                                    href={route('admin.form.edit', form.form_id)}
                                                                    className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
                                                                    onClick={() => setOpenDropdownId(null)}
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
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                        />
                                                                    </svg>
                                                                    Edit
                                                                </Link>
                                                                <Link
                                                                    href={route('admin.form.settings', form.form_id)}
                                                                    className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition"
                                                                    onClick={() => setOpenDropdownId(null)}
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
                                                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                    </svg>
                                                                    Pengaturan
                                                                </Link>
                                                                <Link
                                                                    href={route('admin.form.show', form.form_id)}
                                                                    className="flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                                                                    onClick={() => setOpenDropdownId(null)}
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
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                    Preview
                                                                </Link>
                                                                <Link
                                                                    href={route('admin.form.responses', form.form_id)}
                                                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition"
                                                                    onClick={() => setOpenDropdownId(null)}
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
                                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"
                                                                        />
                                                                    </svg>
                                                                    Lihat Respon
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDeleteClick(form)}
                                                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition w-full text-left"
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
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && filteredForms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredForms.map((form, index) => {
                            const dropdownPosition = openDropdownId === form.form_id ? getGridDropdownPosition(form.form_id) : { top: 0, left: 0 };
                            return (
                                <div
                                    key={form.form_id}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative hover:shadow-xl transition-shadow"
                                >
                                    <div className="absolute top-4 right-4">
                                        <div
                                            className="relative"
                                            ref={(el) => (dropdownRefs.current[form.form_id] = el)}
                                        >
                                            <button
                                                onClick={() => toggleDropdown(form.form_id)}
                                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition focus:outline-none"
                                                aria-label="More actions"
                                                aria-expanded={openDropdownId === form.form_id}
                                                disabled={isDeleting}
                                                data-form-id={form.form_id}
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
                                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                    />
                                                </svg>
                                            </button>
                                            {openDropdownId === form.form_id && (
                                                <div
                                                    className="fixed w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                                                    style={{
                                                        top: `${dropdownPosition.top}px`,
                                                        left: `${dropdownPosition.left}px`,
                                                    }}
                                                >
                                                    <div className="py-1">
                                                        <Link
                                                            href={route('admin.form.edit', form.form_id)}
                                                            className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
                                                            onClick={() => setOpenDropdownId(null)}
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
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={route('admin.form.settings', form.form_id)}
                                                            className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition"
                                                            onClick={() => setOpenDropdownId(null)}
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
                                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                            </svg>
                                                            Pengaturan
                                                        </Link>
                                                        <Link
                                                            href={route('admin.form.show', form.form_id)}
                                                            className="flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                                                            onClick={() => setOpenDropdownId(null)}
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
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                            Preview
                                                        </Link>
                                                        <Link
                                                            href={route('admin.form.responses', form.form_id)}
                                                            className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition"
                                                            onClick={() => setOpenDropdownId(null)}
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
                                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"
                                                                />
                                                            </svg>
                                                            Lihat Respon
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(form)}
                                                            className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition w-full text-left"
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
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.form_name || '-'}</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Beasiswa:</span> {form.scholarship_name || '-'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Tanggal Buka:</span>{' '}
                                        {form.start_date !== '-' ? moment(form.start_date).format('DD MMM YYYY HH:mm') : '-'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Tanggal Tutup:</span>{' '}
                                        {form.close_date !== '-' ? moment(form.close_date).format('DD MMM YYYY HH:mm') : '-'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Status:</span>{' '}
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                form.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {form.status || (form.is_active ? 'Aktif' : 'Non-Aktif')}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Dibuat Oleh:</span> {form.created_by || '-'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {filteredForms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada formulir yang tersedia</h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Tidak ada hasil yang cocok dengan pencarian atau filter Anda.'
                                : 'Silakan tambahkan formulir baru untuk mulai mengelola formulir beasiswa.'}
                        </p>
                        {searchTerm || statusFilter !== 'all' ? (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                }}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
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
                                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center shadow-md"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Formulir Baru
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}