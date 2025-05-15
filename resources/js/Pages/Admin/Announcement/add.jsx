import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';

// Register ImageResize module with Quill
Quill.register('modules/imageResize', ImageResize);

// Define custom toolbar for ReactQuill
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ align: [] }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        [{ color: [] }, { background: [] }],
        ['link', 'image', 'video'],
        ['clean'],
    ],
    imageResize: {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
    },
};

// Define allowed formats for ReactQuill
const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'color', 'background',
    'link', 'image', 'video',
];

export default function Add({ auth, permissions, userRole, menu, categories }) {
    // State for form data
    const [data, setData] = useState({
        announcement_id: '',
        title: '',
        content: '',
        category_id: '',
        file: null,
        created_by: auth.user.id,
        updated_by: null,
    });

    // State for UI
    const [filePreview, setFilePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Client-side validation
        const newErrors = {};
        if (!data.title.trim()) newErrors.title = 'Judul wajib diisi.';
        if (!data.content.trim()) newErrors.content = 'Konten wajib diisi.';
        if (!data.category_id) newErrors.category_id = 'Kategori wajib dipilih.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('announcement_id', data.announcement_id);
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('category_id', data.category_id);
        formData.append('created_by', data.created_by);
        if (data.file) formData.append('file', data.file);

        try {
            await axios.post(route('admin.announcement.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Show success notification
            setNotification({
                show: true,
                type: 'success',
                message: 'Pengumuman berhasil ditambahkan!',
            });

            // Reset form
            setData({
                announcement_id: '',
                title: '',
                content: '',
                category_id: '',
                file: null,
                created_by: auth.user.id,
                updated_by: null,
            });
            setFilePreview(null);

            // Redirect to index page after 1.5 seconds
            setTimeout(() => {
                router.visit(route('admin.announcement.index'));
            }, 1500);
        } catch (error) {
            console.error('Error submitting form:', error);

            // Handle validation errors or server errors
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message:
                        'Gagal menambahkan pengumuman: ' +
                        (error.response?.data?.message || 'Terjadi kesalahan.'),
                });
            }
            setIsSubmitting(false);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setData((prev) => ({ ...prev, file: null }));
            setFilePreview(null);
            return;
        }

        // Validate file size (max 2MB)
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSizeInBytes) {
            setErrors((prev) => ({
                ...prev,
                file: 'Ukuran file terlalu besar. Maksimal 2MB.',
            }));
            setData((prev) => ({ ...prev, file: null }));
            setFilePreview(null);
            return;
        }

        // Update file and preview
        setErrors((prev) => ({ ...prev, file: undefined }));
        setData((prev) => ({ ...prev, file }));
        if (file.type.includes('image')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview({ type: 'image', src: reader.result });
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            setFilePreview({ type: 'pdf', src: URL.createObjectURL(file) });
        }
    };

    // Handle image upload in Quill editor
    const handleQuillImageUpload = async (quill) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            // Validate image size (max 2MB)
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSizeInBytes) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Ukuran gambar di konten terlalu besar. Maksimal 2MB.',
                });
                return;
            }

            // Upload image
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await axios.post(route('admin.announcement.upload-image'), formData, {
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
        };
    };

    // Setup Quill toolbar handlers
    const setupQuill = (quill) => {
        const toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', () => handleQuillImageUpload(quill));
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Pengumuman Baru" />

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
                {/* Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Tambah Pengumuman
                        </h1>
                        <p className="text-gray-500 mt-1">Tambahkan pengumuman yang baru</p>
                    </div>
                    <Link
                        href={route('admin.announcement.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-md p-8">
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6" noValidate>
                        {/* Title Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Judul Pengumuman <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                    errors.title
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan judul pengumuman"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Category Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData((prev) => ({ ...prev, category_id: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                    errors.category_id
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
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

                        {/* File Upload Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">File Pengumuman</label>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div
                                        className={`relative border rounded-lg px-4 py-3 ${
                                            errors.file ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="w-full cursor-pointer opacity-0 absolute inset-0"
                                        />
                                        <span className="text-gray-500">Pilih file...</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format yang didukung: JPG, PNG, PDF. Ukuran maksimal: 2MB
                                    </p>
                                    {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                                </div>
                                {filePreview && (
                                    <div className="relative">
                                        {filePreview.type === 'image' && (
                                            <img
                                                src={filePreview.src}
                                                alt="Preview"
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                            />
                                        )}
                                        {filePreview.type === 'pdf' && (
                                            <a
                                                href={filePreview.src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline block w-24 h-24 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50"
                                            >
                                                Lihat PDF
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilePreview(null);
                                                setData((prev) => ({ ...prev, file: null }));
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Field (ReactQuill) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Konten Pengumuman <span className="text-red-500">*</span>
                            </label>
                            <div
                                className={`border rounded-lg overflow-hidden transition ${
                                    errors.content ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <ReactQuill
                                    value={data.content}
                                    onChange={(content) => setData((prev) => ({ ...prev, content }))}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    onEditorCreated={setupQuill}
                                    className="bg-white"
                                    style={{ height: '300px', marginBottom: '40px' }}
                                />
                            </div>
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link
                                href={route('admin.announcement.index')}
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
                                    'Simpan Pengumuman'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
