import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

export default function Add({ auth, permissions, userRole, menu, categories }) {
    const [data, setData] = useState({
        name: '',
        description: '',
        poster: null,
        start_date: '',
        end_date: '',
        category_id: '',
        created_by: auth.user.id,
        updated_by: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
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

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        if (data.poster) {
            formData.append('poster', data.poster);
        }
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date);
        formData.append('category_id', data.category_id);
        formData.append('created_by', data.created_by);

        try {
            await axios.post(route('admin.scholarship.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setNotification({
                show: true,
                type: 'success',
                message: 'Beasiswa berhasil ditambahkan!',
            });

            // Reset form
            setData({
                name: '',
                description: '',
                poster: null,
                start_date: '',
                end_date: '',
                category_id: '',
                created_by: auth.user.id,
                updated_by: null,
            });

            // Redirect after a short delay for better UX
            setTimeout(() => {
                router.visit(route('admin.scholarship.index'));
            }, 1500);
        } catch (error) {
            console.error(error);

            // Show error notification
            setNotification({
                show: true,
                type: 'error',
                message: 'Gagal menambahkan beasiswa. Silakan coba lagi.'
            });

            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Beasiswa" />

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
                            {notification.type === 'success' ? (
                                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
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

            <div className="py-12 max-w-5xl mx-auto px-6 sm:px-8">
                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Tambah Beasiswa Baru</h1>
                        <Link
                            href={route('admin.Scholarship.index')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                        >
                            ← Kembali
                        </Link>
                        </div>
                    </div>


                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Nama Beasiswa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.name
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan nama beasiswa"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData((prev) => ({ ...prev, category_id: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.category_id
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link
                                href={route('admin.scholarship.index')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Beasiswa'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
