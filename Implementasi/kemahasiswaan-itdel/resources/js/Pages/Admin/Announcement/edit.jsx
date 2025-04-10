import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Edit({ auth, permissions, userRole, menu, categories, announcement, flash }) {
    if (!auth?.user || !announcement) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const [filePreview, setFilePreview] = useState(announcement?.file ? `/storage/${announcement.file}` : null);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const { data, setData, processing, errors, reset } = useForm({
        announcement_id: announcement.announcement_id,
        title: announcement.title,
        content: announcement.content,
        category_id: announcement.category_id,
        file: null,
        updated_by: auth.user.id,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const updateRoute = route('admin.announcement.update', announcement.announcement_id);
        console.log('Update Route:', updateRoute);
        console.log('Form Data:', data);

        router.post(updateRoute, data, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                console.log('Update Success');
                setNotification({
                    show: true,
                    type: 'success',
                    message: flash?.success || 'Pengumuman berhasil diperbarui!',
                });
                reset();
                setFilePreview(null);
            },
            onError: (errors) => {
                console.log('Update Error:', errors);
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal memperbarui pengumuman: ' + (errors.error || 'Periksa input Anda.'),
                });
            },
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('file', file);
        if (file) {
            if (file.type === "application/pdf") {
                setFilePreview(URL.createObjectURL(file));
            } else {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFilePreview(announcement?.file ? `/storage/${announcement.file}` : null);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Pengumuman" />

            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md px-6 py-4 rounded-lg shadow-lg transition-all transform animate-slide-in-right ${
                        notification.type === 'success'
                            ? 'bg-green-50 border-l-4 border-green-500'
                            : 'bg-red-50 border-l-4 border-red-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {notification.type === 'success' ? (
                                <svg
                                    className="h-5 w-5 text-green-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-5 w-5 text-red-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p
                                className={`text-sm font-medium ${
                                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}
                            >
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setNotification({ ...notification, show: false })}
                                    className={`inline-flex rounded-md p-1.5 focus:outline-none ${
                                        notification.type === 'success'
                                            ? 'text-green-500 hover:bg-green-100'
                                            : 'text-red-500 hover:bg-red-100'
                                    }`}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg
                                        className="h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
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
                </div>
            )}

            <div className="py-10 max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Edit Pengumuman</h1>
                    <Link
                        href={route('admin.announcement.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>
                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="bg-white rounded-xl shadow-lg p-6 space-y-6"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Judul Pengumuman <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors?.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                errors.category_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        {errors?.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">File Pengumuman</label>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="relative border border-gray-300 rounded-lg px-4 py-3">
                                    <input
                                        type="file"
                                        accept="image/*, application/pdf"
                                        onChange={handleFileChange}
                                        className="w-full cursor-pointer"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Format yang didukung: JPG, PNG, PDF. Ukuran maksimal: 2MB
                                </p>
                            </div>
                            {filePreview && (
                                <div className="relative">
                                    {filePreview.includes('application/pdf') || filePreview.endsWith('.pdf') ? (
                                        <a
                                            href={filePreview}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 mt-2 block"
                                        >
                                            Lihat PDF
                                        </a>
                                    ) : (
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilePreview(null);
                                            setData('file', null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors?.file && <p className="text-red-500 text-sm">{errors.file}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Konten Pengumuman <span className="text-red-500">*</span>
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <ReactQuill
                                value={data.content}
                                onChange={(content) => setData('content', content)}
                                className="bg-white"
                                style={{ height: '300px' }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 50 karakter</p>
                        {errors?.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Link
                            href={route('admin.announcement.index')}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                    Memperbarui...
                                </>
                            ) : (
                                'Update Pengumuman'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}