import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditActivity({ auth, userRole, permissions, menu, activity }) {
    const { data, setData, put, processing, errors } = useForm({
        title: activity.title,
        description: activity.description || '',
        start_date: activity.start_date,
        end_date: activity.end_date || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.activities.update', activity.id));
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Kegiatan" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className={`backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border
                        ${document.documentElement.classList.contains('light') ? 'bg-white/80 border-gray-200/50' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800/80 border-zinc-700/50' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50/80 border-blue-200/50' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950/80 border-blue-800/50' : ''}`}>
                        <h1 className={`text-3xl font-bold bg-clip-text text-transparent
                            ${document.documentElement.classList.contains('light') ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-gradient-to-r from-blue-300 to-indigo-400' : ''}`}>
                            Edit Kegiatan
                        </h1>
                    </div>

                    <div className={`p-6 rounded-xl shadow-sm
                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-200/50' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700/50' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-200/50' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-800/50' : ''}`}>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                    Judul Kegiatan
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}`}
                                    placeholder="Masukkan judul kegiatan"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                    Deskripsi
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}`}
                                    placeholder="Masukkan deskripsi kegiatan"
                                    rows="4"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}`}
                                    required
                                />
                                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                            </div>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                    Tanggal Selesai (opsional)
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2
                                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 focus:ring-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 focus:ring-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-300 focus:ring-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 focus:ring-blue-300' : ''}`}
                                />
                                {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                        ${document.documentElement.classList.contains('light') ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-400 text-white hover:bg-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}>
                                    Simpan Perubahan
                                </button>
                                <Link
                                    href={route('admin.activities.index')}
                                    className={`px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                        ${document.documentElement.classList.contains('light') ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-600 text-white hover:bg-zinc-500' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : ''}`}>
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