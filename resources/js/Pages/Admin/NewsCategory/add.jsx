import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios'; // Add this import

export default function Add({ auth, userRole, permissions, menu, flash }) {
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        // Client-side validation for required fields
        const newErrors = {};
        if (!formData.category_name.trim()) {
            newErrors.category_name = 'Nama kategori wajib diisi.';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Deskripsi wajib diisi.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return; // Stop submission if there are client-side errors
        }

        try {
            await axios.post(route('admin.news-category.store'), formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setNotification({
                show: true,
                type: 'success',
                message: 'Kategori berhasil ditambahkan!',
            });

            // Reset the form
            setFormData({
                category_name: '',
                description: '',
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
                    message: 'Gagal menambahkan kategori: ' + (error.response?.data?.message || 'Terjadi kesalahan.'),
                });
            }
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Kategori Berita" />

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
                            Tambah Kategori Berita
                        </h1>
                        <p className="text-gray-500 mt-1">Buat kategori baru untuk mengelompokkan berita</p>
                    </div>
                    <Link
                        href={route('admin.news-category.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Kategori <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-lg px-4 py-3 border transition ${
                                        errors.category_name
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Masukkan nama kategori"
                                />
                                {errors.category_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.category_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-lg px-4 py-3 border transition ${
                                        errors.description
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    rows="4"
                                    placeholder="Masukkan deskripsi kategori"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Link
                                href={route('admin.news-category.index')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
