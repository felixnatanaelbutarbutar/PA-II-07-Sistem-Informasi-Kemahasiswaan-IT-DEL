import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';

export default function EditActivity({ auth, userRole, permissions, menu, activity }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [data, setData] = useState({
        title: activity.title,
        description: activity.description || '',
        start_date: activity.start_date,
        end_date: activity.end_date || '',
        updated_by: auth.user.id,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        // Client-side validation
        const newErrors = {};
        if (!data.title.trim()) newErrors.title = 'Judul kegiatan wajib diisi.';
        if (!data.start_date) newErrors.start_date = 'Tanggal mulai wajib diisi.';
        if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
            newErrors.end_date = 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return; // Stop submission if there are errors
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date);
        formData.append('updated_by', data.updated_by);
        formData.append('_method', 'POST'); // Ensure method spoofing if needed

        const updateRoute = route('admin.activities.update', activity.id);

        try {
            const response = await axios.post(updateRoute, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setNotification({
                show: true,
                type: 'success',
                message: response.data.message || 'Kegiatan berhasil diperbarui!',
            });

            // Redirect after a short delay to allow the user to see the notification
            setTimeout(() => {
                window.location.href = route('admin.activities.index');
            }, 1500);
        } catch (error) {
            console.error('Error updating activity:', error);

            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal memperbarui kegiatan: ' + (error.response?.data?.message || 'Terjadi kesalahan.'),
                });
            }
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Kegiatan" />

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

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div
                        className={`backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border
                            ${document.documentElement.classList.contains('light') ? 'bg-white/80 border-gray-200/50' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800/80 border-zinc-700/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50/80 border-blue-200/50' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950/80 border-blue-800/50' : ''}`}
                    >
                        <h1
                            className={`text-3xl font-bold bg-clip-text text-transparent
                                ${document.documentElement.classList.contains('light') ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'bg-gradient-to-r from-blue-300 to-indigo-400' : ''}`}
                        >
                            Edit Kegiatan
                        </h1>
                    </div>

                    <div
                        className={`p-6 rounded-xl shadow-sm
                            ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-200/50' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-200/50' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-800/50' : ''}`}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="mb-4">
                                <label
                                    className={`block text-sm font-medium mb-1
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}
                                >
                                    Judul Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData({ ...data, title: e.target.value })}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}
                                        ${errors.title ? 'border-red-500' : ''}`}
                                    placeholder="Masukkan judul kegiatan"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>
                            <div className="mb-4">
                                <label
                                    className={`block text-sm font-medium mb-1
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}
                                >
                                    Deskripsi
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}
                                        ${errors.description ? 'border-red-500' : ''}`}
                                    placeholder="Masukkan deskripsi kegiatan"
                                    rows="4"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label
                                    className={`block text-sm font-medium mb-1
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}
                                >
                                    Tanggal Mulai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData({ ...data, start_date: e.target.value })}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}
                                        ${errors.start_date ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.start_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label
                                    className={`block text-sm font-medium mb-1
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}
                                >
                                    Tanggal Selesai (opsional)
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData({ ...data, end_date: e.target.value })}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}
                                        ${errors.end_date ? 'border-red-500' : ''}`}
                                />
                                {errors.end_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                                )}
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                        ${document.documentElement.classList.contains('light') ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-400 text-white hover:bg-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}
                                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                            Memperbarui...
                                        </>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </button>
                                <Link
                                    href={route('admin.activities.index')}
                                    className={`px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                        ${document.documentElement.classList.contains('light') ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-600 text-white hover:bg-zinc-500' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : ''}`}
                                >
                                    Kembali
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}