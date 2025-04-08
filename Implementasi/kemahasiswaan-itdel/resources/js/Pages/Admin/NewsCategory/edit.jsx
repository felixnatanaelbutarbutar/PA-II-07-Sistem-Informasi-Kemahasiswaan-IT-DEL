import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ auth, userRole, permissions, menu, category }) {
    const [formData, setFormData] = useState({
        category_id: category?.category_id || '',
        category_name: category?.category_name || '',
        description: category?.description || '',
    });
    const [errors, setErrors] = useState({});

    // Debugging: Log data category untuk memastikan data diterima
    useEffect(() => {
        console.log('Category data:', category);
    }, [category]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category?.category_id) {
            setErrors({ general: 'ID kategori tidak ditemukan. Silakan coba lagi.' });
            return;
        }
        // Debugging: Log rute yang digunakan
        console.log('Submitting to route:', route('admin.news-category.update', category.category_id));
        router.put(route('admin.news-category.update', category.category_id), formData, {
            onError: (errors) => {
                setErrors(errors);
            },
            onSuccess: () => {
                console.log('Update successful');
            },
        });
    };

    // Jika category tidak ada, tampilkan pesan error
    if (!category) {
        return (
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title="Edit Kategori Berita" />
                <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">Kategori tidak ditemukan. Silakan kembali ke daftar kategori.</p>
                        <Link
                            href={route('admin.news-category.index')}
                            className="mt-2 inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Kategori Berita" />

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Edit Kategori Berita
                    </h1>
                    <p className="text-gray-500 mt-1">Perbarui informasi kategori berita</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    {errors.general && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                            {errors.general}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    ID Kategori
                                </label>
                                <input
                                    type="text"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Masukkan nama kategori"
                                />
                                {errors.category_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    placeholder="Masukkan deskripsi kategori (opsional)"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                            >
                                Perbarui
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}