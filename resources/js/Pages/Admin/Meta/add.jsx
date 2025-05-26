import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';

// Register the ImageResize module with Quill
Quill.register('modules/imageResize', ImageResize);

// Define custom toolbar for ReactQuill
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'align': [] }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean'],
    ],
    imageResize: {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
    },
};

export default function Add({ auth, permissions, userRole, menu }) {
    const [data, setData] = useState({
        id: '',
        meta_key: '',
        meta_title: '',
        meta_description: '',
        is_active: true,
        created_by: auth.user.id,
        updated_by: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        // Client-side validation
        const newErrors = {};
        if (!data.id.trim()) newErrors.id = 'ID wajib diisi.';
        if (data.id.length > 10) newErrors.id = 'ID maksimal 10 karakter.';
        if (!data.meta_key.trim()) newErrors.meta_key = 'Meta Key wajib diisi.';
        if (data.meta_key.length > 255) newErrors.meta_key = 'Meta Key maksimal 255 karakter.';
        if (!data.meta_title.trim()) newErrors.meta_title = 'Meta Title wajib diisi.';
        if (data.meta_title.length > 255) newErrors.meta_title = 'Meta Title maksimal 255 karakter.';
        if (!data.meta_description.trim()) newErrors.meta_description = 'Meta Description wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('id', data.id);
        formData.append('meta_key', data.meta_key);
        formData.append('meta_title', data.meta_title);
        formData.append('meta_description', data.meta_description);
        formData.append('is_active', data.is_active ? '1' : '0');
        formData.append('created_by', data.created_by);

        try {
            await axios.post(route('admin.meta.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setNotification({
                show: true,
                type: 'success',
                message: 'Meta berhasil ditambahkan!',
            });

            // Reset form
            setData({
                id: '',
                meta_key: '',
                meta_title: '',
                meta_description: '',
                is_active: true,
                created_by: auth.user.id,
                updated_by: null,
            });

            setTimeout(() => {
                router.visit(route('admin.meta.index'));
            }, 1500);
        } catch (error) {
            console.error('Error submitting form:', error);

            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal menambahkan meta: ' + (error.response?.data?.message || 'Terjadi kesalahan.'),
                });
            }
            setIsSubmitting(false);
        }
    };

    // Custom handler for image uploads in ReactQuill
    const handleQuillImageUpload = async (quill) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
                if (file.size > maxSizeInBytes) {
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Ukuran gambar di konten terlalu besar. Maksimal 2MB.',
                    });
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await axios.post(route('admin.meta.upload-image'), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const imageUrl = response.data.url;
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', imageUrl);
                    quill.format('align', 'left');
                } catch (error) {
                    console.error('Error uploading image to content:', error);
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal mengunggah gambar ke konten.',
                    });
                }
            }
        };
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'bullet', 'indent',
        'blockquote', 'code-block',
        'color', 'background',
        'link', 'image',
    ];

    const setupQuill = (quill) => {
        const toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', () => handleQuillImageUpload(quill));
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Meta Baru" />

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

            <div className="py-12 max-w-5xl mx-auto px-6 sm:px-8">
                {/* Styled Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Tambah Meta Baru
                        </h1>
                        <p className="text-gray-500 mt-1">Tambahkan data meta baru</p>
                    </div>
                    <Link
                        href={route('admin.meta.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.id}
                                onChange={(e) => setData((prev) => ({ ...prev, id: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.id
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan ID (maks. 10 karakter)"
                                maxLength={10}
                            />
                            {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Meta Key <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.meta_key}
                                onChange={(e) => setData((prev) => ({ ...prev, meta_key: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.meta_key
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan Meta Key (unik)"
                                maxLength={255}
                            />
                            {errors.meta_key && <p className="text-red-500 text-xs mt-1">{errors.meta_key}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Meta Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.meta_title}
                                onChange={(e) => setData((prev) => ({ ...prev, meta_title: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.meta_title
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan Meta Title"
                                maxLength={255}
                            />
                            {errors.meta_title && (
                                <p className="text-red-500 text-xs mt-1">{errors.meta_title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Meta Description <span className="text-red-500">*</span>
                            </label>
                            <div
                                className={`border rounded-lg overflow-hidden transition ${
                                    errors.meta_description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            >
                                <ReactQuill
                                    value={data.meta_description}
                                    onChange={(content) => setData((prev) => ({ ...prev, meta_description: content }))}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    onEditorCreated={setupQuill}
                                    className="bg-white"
                                    style={{ height: '300px' }}
                                />
                            </div>
                            {errors.meta_description && (
                                <p className="text-red-500 text-xs mt-1">{errors.meta_description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Status Aktif
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData((prev) => ({ ...prev, is_active: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Aktifkan Meta (Jika dicentang, meta akan aktif)
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link
                                href={route('admin.meta.index')}
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
                                    'Simpan Meta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}