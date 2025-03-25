import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ auth, permissions, userRole, menu, achievement, categories, achievementTypes }) {
    const { data, setData, put, processing, errors } = useForm({
        title: achievement.title || '',
        category: achievement.category || '',
        achievement_type_id: achievement.achievement_type_id || '',
    });

    const [notification, setNotification] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.achievements.update', achievement.achievement_id), {
            onSuccess: () => {
                setNotification({ type: 'success', message: 'Prestasi berhasil diperbarui!' });
                setTimeout(() => setNotification(null), 5000);
            },
            onError: () => {
                setNotification({ type: 'error', message: 'Gagal memperbarui prestasi.' });
                setTimeout(() => setNotification(null), 5000);
            },
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Edit Prestasi" />

            {notification && (
                <div className="fixed top-4 right-4 z-50 max-w-md bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-emerald-500 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className={`h-5 w-5 ${notification.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                {notification.type === 'success' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                )}
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-auto p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-md">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-200/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Edit Prestasi</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Prestasi</label>
                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="International">International</option>
                                <option value="National">National</option>
                                <option value="Regional">Regional</option>
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>


                        <div>
                            <label htmlFor="achievement_type_id" className="block text-sm font-medium text-gray-700">Jenis Prestasi</label>
                            <select
                                id="achievement_type_id"
                                value={data.achievement_type_id}
                                onChange={(e) => setData('achievement_type_id', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                required
                            >
                                <option value="">Pilih Jenis Prestasi</option>
                                {achievementTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.type_name}</option>
                                ))}
                            </select>
                            {errors.achievement_type_id && <p className="mt-1 text-sm text-red-600">{errors.achievement_type_id}</p>}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('admin.achievements.index')}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-md"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}