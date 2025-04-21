import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

export default function OrganizationAdminEditPassword({ auth, userRole, permissions, navigation, admin, notification }) {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);

    useEffect(() => {
        if (notification) {
            setNotificationMessage(notification);
            setShowNotification(true);

            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.organization-admins.updatePassword', admin.id), {
            onSuccess: () => {
                setShowNotification(true);
                setNotificationMessage({ type: 'success', 'message': 'Password admin organisasi berhasil diubah.' });
            },
            onError: () => {
                setShowNotification(true);
                setNotificationMessage({ type: 'error', message: 'Gagal memperbarui password. Silakan coba lagi.' });
            },
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={navigation}
        >
            <Head title="Ubah Password Admin Organisasi" />

            <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6">
                {showNotification && notificationMessage && (
                    <div
                        className={`mb-6 rounded-lg p-4 text-sm font-medium transition-opacity duration-500 ${
                            notificationMessage.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {notificationMessage.message}
                    </div>
                )}

                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Ubah Password Admin Organisasi
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Ubah password untuk akun {admin.name} ({admin.username})
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('admin.organization-admins.index')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}