import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Add({ auth, userRole, permissions, menu }) {
    const { flash } = usePage().props ?? {};
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [data, setData] = useState({
        type_name: '',
        description: '',
    });
    const [clientErrors, setClientErrors] = useState({}); // State untuk validasi sisi klien
    const [serverErrors, setServerErrors] = useState({}); // State untuk error dari server

    // Handle flash messages for notifications
    useEffect(() => {
        if (flash && flash.success) {
            setNotificationMessage(flash.success);
            setNotificationType('success');
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
        if (flash && flash.error) {
            setNotificationMessage(flash.error);
            setNotificationType('error');
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation for required fields
        const newErrors = {};
        if (!data.type_name.trim()) newErrors.type_name = 'Nama Jenis Prestasi wajib diisi.';
        if (!data.description.trim()) newErrors.description = 'Deskripsi wajib diisi.'; // Validasi deskripsi wajib

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors); // Simpan error validasi sisi klien
            return; // Stop submission if there are client-side errors
        }

        // Jika tidak ada error sisi klien, lanjutkan submit
        setClientErrors({}); // Reset client errors sebelum submit
        setServerErrors({}); // Reset server errors sebelum submit
        router.post(route('admin.achievement-type.store'), data, {
            onError: (errors) => {
                setServerErrors(errors); // Simpan error dari server
                setNotificationType('error');
                setNotificationMessage('Gagal menambahkan jenis prestasi. Silakan coba lagi.');
                setShowNotification(true);
            },
            onSuccess: () => {
                setNotificationType('success');
                setNotificationMessage('Jenis prestasi berhasil ditambahkan!');
                setShowNotification(true);
                setData({ type_name: '', description: '' });
                setClientErrors({});
                setServerErrors({});
                setTimeout(() => {
                    router.visit(route('admin.achievement-type.index'));
                }, 1500);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Jenis Prestasi" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notificationType === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notificationType === 'success' ? (
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
                                    notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notificationMessage}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notificationType === 'success'
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

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Tambah Jenis Prestasi
                    </h1>
                    <p className="text-gray-600 mt-1">Tambah jenis prestasi baru untuk website</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Type Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Jenis Prestasi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.type_name}
                                    onChange={(e) => setData({ ...data, type_name: e.target.value })}
                                    className={`mt-1 block w-full px-4 py-2 border rounded-lg transition ${
                                        (serverErrors.type_name || clientErrors.type_name)
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Masukkan nama jenis prestasi"
                                />
                                {(serverErrors.type_name || clientErrors.type_name) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.type_name || clientErrors.type_name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi <span className="text-red-500">*</span> {/* Tambah tanda wajib */}
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    className={`mt-1 block w-full px-4 py-2 border rounded-lg transition ${
                                        serverErrors.description || clientErrors.description
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Masukkan deskripsi"
                                    rows="4"
                                />
                                {(serverErrors.description || clientErrors.description) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.description || clientErrors.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex space-x-3">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Simpan
                            </button>
                            <Link
                                href={route('admin.achievement-type.index')}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                            >
                                Batal
                            </Link>
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