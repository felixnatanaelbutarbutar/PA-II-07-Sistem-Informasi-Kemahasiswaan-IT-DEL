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
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headers
        ['bold', 'italic', 'underline', 'strike'], // Text formatting
        [{ 'align': [] }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }], // Alignment
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Lists
        [{ 'indent': '-1' }, { 'indent': '+1' }], // Indentation
        ['blockquote', 'code-block'], // Blockquote and code block
        [{ 'color': [] }, { 'background': [] }], // Text and background color
        ['link', 'image', 'video'], // Link, image, and video
        ['clean'], // Clear formatting
    ],
    imageResize: {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize', 'Toolbar'], // Enable resize, display size, and toolbar
    },
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'color', 'background',
    'link', 'image', 'video',
];

export default function Add({ auth, permissions, userRole, menu, categories }) {
    const [data, setData] = useState({
        name: '',
        description: '',
        poster: null,
        category_id: '',
        is_active: true,
        created_by: auth.user.id,
        updated_by: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [posterPreview, setPosterPreview] = useState(null);

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleInputChange = (key, value) => {
        setData((prev) => ({ ...prev, [key]: value }));
        // Clear error for the field when user starts typing
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const handlePosterChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (file.size > maxSizeInBytes) {
                setErrors((prev) => ({
                    ...prev,
                    poster: 'Ukuran file terlalu besar. Maksimal 5MB.',
                }));
                setData((prev) => ({ ...prev, poster: null }));
                setPosterPreview(null);
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                setErrors((prev) => ({
                    ...prev,
                    poster: 'File harus berupa JPG atau PNG.',
                }));
                setData((prev) => ({ ...prev, poster: null }));
                setPosterPreview(null);
                return;
            }
            setErrors((prev) => ({ ...prev, poster: undefined }));
            setData((prev) => ({ ...prev, poster: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPosterPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setErrors((prev) => ({ ...prev, poster: undefined }));
            setData((prev) => ({ ...prev, poster: null }));
            setPosterPreview(null);
        }
    };

    const handleQuillImageUpload = async (quill) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSizeInBytes) {
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Ukuran gambar di konten terlalu besar. Maksimal 5MB.',
                    });
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await axios.post(route('admin.upload.image'), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const imageUrl = response.data.url;
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', imageUrl);
                    quill.format('align', 'left');
                } catch (error) {
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal mengunggah gambar ke konten.',
                    });
                }
            }
        };
    };

    const setupQuill = (quill) => {
        const toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', () => handleQuillImageUpload(quill));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Client-side validation
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = 'Nama beasiswa wajib diisi.';
        if (!data.description.replace(/<(.|\n)*?>/g, '').trim())
            newErrors.description = 'Deskripsi wajib diisi.';
        if (data.poster) {
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (data.poster.size > maxSizeInBytes) {
                newErrors.poster = 'Ukuran file terlalu besar. Maksimal 5MB.';
            } else if (!allowedTypes.includes(data.poster.type)) {
                newErrors.poster = 'File harus berupa JPG atau PNG.';
            }
        }
        if (!data.category_id) newErrors.category_id = 'Kategori wajib dipilih.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            setNotification({
                show: true,
                type: 'error',
                message: 'Harap lengkapi semua kolom yang diperlukan dengan benar.',
            });
            return;
        }

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('category_id', data.category_id);
        formData.append('is_active', data.is_active ? 1 : 0);
        formData.append('created_by', data.created_by);
        if (data.poster) {
            formData.append('poster', data.poster);
        }

        try {
            await axios.post(route('admin.scholarship.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setNotification({
                show: true,
                type: 'success',
                message: 'Beasiswa berhasil ditambahkan!',
            });

            setData({
                name: '',
                description: '',
                poster: null,
                category_id: '',
                is_active: true,
                created_by: auth.user.id,
                updated_by: null,
            });
            setPosterPreview(null);

            setTimeout(() => {
                router.visit(route('admin.scholarship.index'));
            }, 1500);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            }
            setNotification({
                show: true,
                type: 'error',
                message: 'Gagal menambahkan beasiswa: ' + (error.response?.data?.message || 'Terjadi kesalahan.'),
            });
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Beasiswa Baru" />

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
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Tambah Beasiswa Baru
                        </h1>
                        <p className="text-gray-500 mt-1">Buat beasiswa baru untuk pendaftaran</p>
                    </div>
                    <Link
                        href={route('admin.scholarship.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-8">
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Nama Beasiswa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
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
                                onChange={(e) => handleInputChange('category_id', e.target.value)}
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
                            {errors.category_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Poster Beasiswa
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div
                                        className={`relative border rounded-lg px-4 py-3 ${
                                            errors.poster ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            onChange={handlePosterChange}
                                            className="w-full cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format yang didukung: JPG, PNG. Ukuran maksimal: 5MB
                                    </p>
                                    {errors.poster && (
                                        <p className="text-red-500 text-xs mt-1">{errors.poster}</p>
                                    )}
                                </div>
                                {posterPreview && (
                                    <div className="relative">
                                        <img
                                            src={posterPreview}
                                            alt="Poster Preview"
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPosterPreview(null);
                                                setData((prev) => ({ ...prev, poster: null }));
                                                setErrors((prev) => ({ ...prev, poster: undefined }));
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Deskripsi Beasiswa <span className="text-red-500">*</span>
                            </label>
                            <div
                                className={`border rounded-lg overflow-hidden transition ${
                                    errors.description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            >
                                <ReactQuill
                                    value={data.description}
                                    onChange={(content) => handleInputChange('description', content)}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    onEditorCreated={setupQuill}
                                    className="bg-white"
                                    style={{ height: '300px' }}
                                />
                            </div>
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
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