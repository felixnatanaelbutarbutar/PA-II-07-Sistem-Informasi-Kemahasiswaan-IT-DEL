import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const ResponseDetail = () => {
    const { auth, userRole, permissions, form, submission, menu, flash } = usePage().props;
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

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

    // Jika form atau submission tidak ada, tampilkan pesan error
    if (!form || !submission) {
        return (
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title="Detail Respons - Tidak Ditemukan" />
                <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Detail Respons - Data Tidak Ditemukan
                        </h1>
                        <p className="text-gray-600 mt-1">Data yang Anda cari tidak ditemukan.</p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Link
                            href={route('admin.form.responses', form?.form_id || '')}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title={`Detail Respons - ${form.form_name}`} />

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
                        Detail Respons: {form.form_name}
                    </h1>
                    <p className="text-gray-600 mt-1">Beasiswa: {form.scholarship_name}</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Pengirim</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Nama:</p>
                            <p className="text-sm text-gray-600">{submission.user?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">NIM:</p>
                            <p className="text-sm text-gray-600">{submission.user?.nim || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Prodi:</p>
                            <p className="text-sm text-gray-600">{submission.user?.prodi || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Angkatan:</p>
                            <p className="text-sm text-gray-600">{submission.user?.angkatan || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Email:</p>
                            <p className="text-sm text-gray-600">{submission.user?.email || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Tanggal Pengajuan:</p>
                            <p className="text-sm text-gray-600">{submission.submitted_at || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Detail Respons</h2>
                    <div className="space-y-4">
                        {submission.data && submission.data.length > 0 ? (
                            submission.data.map((item, index) => (
                                <div key={index} className="border-b pb-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        {item.field_name || 'Field Tidak Diketahui'}:
                                    </p>
                                    {item.field_type === 'file' && item.value ? (
                                        <a
                                            href={item.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 transition-all"
                                        >
                                            Lihat File
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-600">{item.value || '-'}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-600">Tidak ada data respons.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        href={route('admin.form.responses', form.form_id)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                    >
                        Kembali
                    </Link>
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
};

export default ResponseDetail;