import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios'; // Add axios import

export default function Edit({ auth, userRole, permissions, menu, category, flash }) {
    const [values, setValues] = useState({
        category_name: category.category_name || '',
        description: category.description || '',
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        // Client-side validation for required fields
        const newErrors = {};
        if (!values.category_name.trim()) {
            newErrors.category_name = 'Nama kategori wajib diisi.';
        }
        if (!values.description.trim()) {
            newErrors.description = 'Deskripsi wajib diisi.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return; // Stop submission if there are client-side errors
        }

        try {
            await axios.post(route('admin.news-category.update', category.category_id), values, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setNotification({
                show: true,
                type: 'success',
                message: 'Kategori berhasil diperbarui!',
            });

            // Redirect after 1.5 seconds
            setTimeout(() => {
                router.visit(route('admin.news-category.index'));
            }, 1500);
        } catch (error) {
            console.error('Error submitting form:', error);

            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal memperbarui kategori: ' + (error.response?.data?.message || 'Terjadi kesalahan.'),
                });
            }
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Kategori Berita" />

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
                {/* Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Edit Kategori Berita
                            </h1>
                            <p className="text-gray-500 mt-1">Perbarui informasi kategori berita</p>
                        </div>
                        <Link
                            href={route('admin.news-category.index')}
                            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
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
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Form Edit */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="category_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Kategori <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="category_name"
                                id="category_name"
                                value={values.category_name}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-lg border transition p-3 ${
                                    errors.category_name
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } shadow-sm sm:text-sm`}
                                placeholder="Masukkan nama kategori"
                            />
                            {errors.category_name && (
                                <p className="mt-2 text-sm text-red-600">{errors.category_name}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                value={values.description}
                                onChange={handleChange}
                                rows="4"
                                className={`mt-1 block w-full rounded-lg border transition p-3 ${
                                    errors.description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } shadow-sm sm:text-sm`}
                                placeholder="Masukkan deskripsi kategori"
                            />
                            {errors.description && (
                                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
