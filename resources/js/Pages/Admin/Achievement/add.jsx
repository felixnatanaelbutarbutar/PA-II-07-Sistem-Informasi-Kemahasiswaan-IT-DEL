import { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Add({ auth, permissions, userRole, menu, achievementTypes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category: '',
        achievement_type_id: '',
        medal: '',
        event_name: '',
        event_date: '',
        image: null, // Tambahkan field untuk image
        is_active: true, // Default is_active true
        created_by: auth.user.id,
        updated_by: null,
    });

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [clientErrors, setClientErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null); // State untuk preview gambar

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Handle image change and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi format dan ukuran file
            const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!validFormats.includes(file.type)) {
                setClientErrors((prev) => ({
                    ...prev,
                    image: 'Gambar harus berformat JPG, JPEG, atau PNG.',
                }));
                setData('image', null);
                setImagePreview(null);
                return;
            }

            if (file.size > maxSize) {
                setClientErrors((prev) => ({
                    ...prev,
                    image: 'Ukuran gambar maksimal 2MB.',
                }));
                setData('image', null);
                setImagePreview(null);
                return;
            }

            setClientErrors((prev) => ({ ...prev, image: null }));
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation for required fields
        const newErrors = {};
        if (!data.title.trim()) newErrors.title = 'Judul wajib diisi.';
        if (!data.description.trim()) newErrors.description = 'Deskripsi wajib diisi.';
        if (!data.category) newErrors.category = 'Kategori wajib dipilih.';
        if (!data.achievement_type_id) newErrors.achievement_type_id = 'Jenis prestasi wajib dipilih.';
        if (!data.event_name.trim()) newErrors.event_name = 'Nama acara wajib diisi.';
        if (!data.event_date) newErrors.event_date = 'Tanggal acara wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            return;
        }

        setClientErrors({});
        post(route('admin.achievements.store'), {
            onSuccess: () => {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Prestasi berhasil ditambahkan!',
                });
                reset();
                setImagePreview(null); // Reset preview gambar
                setTimeout(() => {
                    router.visit(route('admin.achievements.index'));
                }, 1500);
            },
            onError: (serverErrors) => {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal menambahkan prestasi. Silakan coba lagi.',
                });
                console.log('Form submission errors:', serverErrors);
            },
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Prestasi Baru" />

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
                            Tambah Prestasi Baru
                        </h1>
                        <p className="text-gray-500 mt-1">Tambahkan prestasi baru untuk ditampilkan</p>
                    </div>
                    <Link
                        href={route('admin.achievements.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {/* Judul Prestasi */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Judul Prestasi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.title || clientErrors.title
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan judul prestasi"
                            />
                            {(errors.title || clientErrors.title) && (
                                <p className="text-red-500 text-xs mt-1">{errors.title || clientErrors.title}</p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.description || clientErrors.description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan deskripsi prestasi"
                                rows="5"
                            />
                            {(errors.description || clientErrors.description) && (
                                <p className="text-red-500 text-xs mt-1">{errors.description || clientErrors.description}</p>
                            )}
                        </div>

                        {/* Kategori */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.category || clientErrors.category
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="International">International</option>
                                <option value="National">National</option>
                                <option value="Regional">Regional</option>
                            </select>
                            {(errors.category || clientErrors.category) && (
                                <p className="text-red-500 text-xs mt-1">{errors.category || clientErrors.category}</p>
                            )}
                        </div>

                        {/* Jenis Prestasi */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Jenis Prestasi <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.achievement_type_id}
                                onChange={(e) => setData('achievement_type_id', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.achievement_type_id || clientErrors.achievement_type_id
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Pilih Jenis Prestasi</option>
                                {achievementTypes.map((type) => (
                                    <option key={type.type_id} value={type.type_id}>
                                        {type.type_name}
                                    </option>
                                ))}
                            </select>
                            {(errors.achievement_type_id || clientErrors.achievement_type_id) && (
                                <p className="text-red-500 text-xs mt-1">{errors.achievement_type_id || clientErrors.achievement_type_id}</p>
                            )}
                        </div>

                        {/* Medali */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Medali</label>
                            <select
                                value={data.medal}
                                onChange={(e) => setData('medal', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="">Tidak Ada</option>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Bronze">Bronze</option>
                            </select>
                            {errors.medal && <p className="text-red-500 text-xs mt-1">{errors.medal}</p>}
                        </div>

                        {/* Nama Acara */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Nama Acara <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.event_name}
                                onChange={(e) => setData('event_name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.event_name || clientErrors.event_name
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan nama acara"
                            />
                            {(errors.event_name || clientErrors.event_name) && (
                                <p className="text-red-500 text-xs mt-1">{errors.event_name || clientErrors.event_name}</p>
                            )}
                        </div>

                        {/* Tanggal Acara */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Tanggal Acara <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.event_date}
                                onChange={(e) => setData('event_date', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.event_date || clientErrors.event_date
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            />
                            {(errors.event_date || clientErrors.event_date) && (
                                <p className="text-red-500 text-xs mt-1">{errors.event_date || clientErrors.event_date}</p>
                            )}
                        </div>

                        {/* Gambar */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Gambar Prestasi <span className="text-gray-500 text-xs">(Opsional, maks 2MB)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleImageChange}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.image || clientErrors.image
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            />
                            {(errors.image || clientErrors.image) && (
                                <p className="text-red-500 text-xs mt-1">{errors.image || clientErrors.image}</p>
                            )}
                            {imagePreview && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600">Pratinjau Gambar:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Image Preview"
                                        className="mt-2 w-48 h-48 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Status Aktif */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    {data.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>
                            {errors.is_active && (
                                <p className="text-red-500 text-xs mt-1">{errors.is_active}</p>
                            )}
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link
                                href={route('admin.achievements.index')}
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
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Prestasi'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .animate-slide-in-right {
                    animation: slide-in-right 0.5s ease-out;
                }
            `}</style>
        </AdminLayout>
    );
}