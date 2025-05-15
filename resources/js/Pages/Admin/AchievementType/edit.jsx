import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ auth, userRole, permissions, menu, achievementType }) {
    const { flash } = usePage().props ?? {};
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [data, setData] = useState({
        type_name: achievementType.type_name || '',
        description: achievementType.description || '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle flash messages and notification state
    useEffect(() => {
        if (flash) {
            if (flash.success) {
                setNotification({
                    show: true,
                    type: 'success',
                    message: flash.success,
                });
            } else if (flash.error) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: flash.error,
                });
            }
        }

        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash, notification]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Client-side validation
        const newErrors = {};
        if (!data.type_name.trim()) newErrors.type_name = 'Nama jenis prestasi wajib diisi.';
        if (!data.description.trim()) newErrors.description = 'Deskripsi wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        router.post(route('admin.achievement-type.update', achievementType.type_id), data, {
            onStart: () => console.log('Submission started'),
            onSuccess: (page) => {
                console.log('Submission success, page:', page.props.flash);
                setErrors({});
                setIsSubmitting(false);
                setNotification({
                    show: true,
                    type: 'success',
                    message: page.props.flash?.success || 'Jenis prestasi berhasil diperbarui!',
                });
                setTimeout(() => {
                    router.visit(route('admin.achievement-type.index'));
                }, 1500);
            },
            onError: (errors) => {
                console.log('Submission error, errors:', errors);
                setErrors(errors);
                setIsSubmitting(false);
                setNotification({
                    show: true,
                    type: 'error',
                    message: errors.error || 'Gagal memperbarui jenis prestasi. Periksa input Anda.',
                });
            },
            onFinish: () => console.log('Submission finished'),
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Jenis Prestasi" />

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
                            Edit Jenis Prestasi
                        </h1>
                        <p className="text-gray-500 mt-1">Perbarui data jenis prestasi untuk website</p>
                    </div>
                    <Link
                        href={route('admin.achievement-type.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Nama Jenis Prestasi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.type_name}
                                onChange={(e) => setData((prev) => ({ ...prev, type_name: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.type_name
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="Masukkan nama jenis prestasi"
                            />
                            {errors.type_name && <p className="text-red-500 text-xs mt-1">{errors.type_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                rows="4"
                                placeholder="Masukkan deskripsi"
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link
                                href={route('admin.achievement-type.index')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                        Memperbarui...
                                    </>
                                ) : (
                                    'Simpan'
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