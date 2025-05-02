import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

export default function Add({ auth, permissions, userRole, menu, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        poster: null,
        start_date: '',
        end_date: '',
        category_id: '',
        is_active: true,
        created_by: auth.user.id,
        updated_by: null,
    });

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [posterPreview, setPosterPreview] = useState(null);

    // Quill toolbar configuration
    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (file.size > maxSizeInBytes) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Ukuran file terlalu besar. Maksimal 2MB.',
                });
                setData('poster', null);
                setPosterPreview(null);
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'File harus berupa JPG, PNG, atau PDF.',
                });
                setData('poster', null);
                setPosterPreview(null);
                return;
            }
            setData('poster', file);
            if (file.type.includes('image')) {
                setPosterPreview(URL.createObjectURL(file));
            } else {
                setPosterPreview('pdf'); // Indicate PDF for icon display
            }
        } else {
            setData('poster', null);
            setPosterPreview(null);
        }
    };

    const handleQuillImage = async (e) => {
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
                        message: 'Ukuran gambar terlalu besar. Maksimal 2MB.',
                    });
                    return;
                }
                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    const response = await axios.post(route('admin.upload.image'), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    const quill = e.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', response.data.url);
                } catch (error) {
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal mengunggah gambar. Silakan coba lagi.',
                    });
                }
            }
        };
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = 'Nama beasiswa wajib diisi.';
        if (!data.description.replace(/<(.|\n)*?>/g, '').trim())
            newErrors.description = 'Deskripsi wajib diisi.';
        if (!data.start_date) newErrors.start_date = 'Tanggal mulai wajib diisi.';
        if (!data.end_date) newErrors.end_date = 'Tanggal selesai wajib diisi.';
        if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) {
            newErrors.end_date = 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.';
        }
        if (!data.category_id) newErrors.category_id = 'Kategori wajib dipilih.';

        if (Object.keys(newErrors).length > 0) {
            setNotification({
                show: true,
                type: 'error',
                message: 'Harap lengkapi semua kolom yang diperlukan dengan benar.',
            });
            setErrors(newErrors);
            return;
        }

        post(route('admin.scholarship.store'), {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Beasiswa berhasil ditambahkan!',
                });
                reset();
                setPosterPreview(null);
                setTimeout(() => {
                    router.visit(route('admin.scholarship.index'));
                }, 1500);
            },
            onError: (serverErrors) => {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal menambahkan beasiswa. Periksa kembali isian Anda.',
                });
                setErrors(serverErrors);
            },
        });
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
                                <svg
                                    className="h-5 w-5 text-emerald-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-5 w-5 text-rose-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
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
                                    notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setNotification({ show: false, type: '', message: '' })}
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
                                onChange={(e) => setData('name', e.target.value)}
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
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <ReactQuill
                                value={data.description}
                                onChange={(content) => setData('description', content)}
                                modules={{
                                    ...quillModules,
                                    toolbar: {
                                        container: quillModules.toolbar,
                                        handlers: { image: handleQuillImage },
                                    },
                                }}
                                theme="snow"
                                className={`border rounded-lg ${
                                    errors.description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Poster</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.poster
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format yang didukung: JPG, PNG, PDF. Ukuran maksimal: 2MB
                            </p>
                            {posterPreview && (
                                <div className="mt-2">
                                    {posterPreview === 'pdf' ? (
                                        <div className="flex items-center space-x-2">
                                            <svg
                                                className="w-12 h-12 text-red-500"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm0 2h7v5h5v11H6V4zm2 8h8v2H8v-2zm0 4h8v2H8v-2z" />
                                            </svg>
                                            <span>PDF Selected</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={posterPreview}
                                            alt="Poster Preview"
                                            className="max-w-xs h-auto rounded-lg shadow-md"
                                        />
                                    )}
                                </div>
                            )}
                            {errors.poster && <p className="text-red-500 text-xs mt-1">{errors.poster}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Tanggal Mulai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.start_date
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            />
                            {errors.start_date && (
                                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Tanggal Selesai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.end_date
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            />
                            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
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
                                disabled={processing}
                            >
                                {processing ? (
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
