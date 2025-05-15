import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function DownloadAdd({ auth, userRole, permissions, navigation, categories }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        file: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category_id', formData.category_id);
        if (formData.file) {
            data.append('file', formData.file);
        }

        router.post(route('admin.downloads.store'), data);
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={navigation}
        >
            <Head title="Tambah File Unduhan" />

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-200/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                        Tambah File Unduhan
                    </h1>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Judul
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                                    Kategori
                                </label>
                                <select
                                    name="category_id"
                                    id="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                                    File (PDF, DOC, DOCX, XLS, XLSX)
                                </label>
                                <input
                                    type="file"
                                    name="file"
                                    id="file"
                                    onChange={handleChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.get(route('admin.downloads.index'))}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}