import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaEye, FaTrash, FaChevronLeft, FaChevronRight, FaPowerOff } from 'react-icons/fa';

export default function AspirationIndex({ auth, userRole, permissions, menu, aspirations, mpm, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [aspirationToDelete, setAspirationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    // Handle flash messages for notifications
    useEffect(() => {
        if (flash) {
            if (flash.success) {
                setNotificationMessage(flash.success);
                setNotificationType('success');
                setShowNotification(true);
            } else if (flash.error) {
                setNotificationMessage(flash.error);
                setNotificationType('error');
                setShowNotification(true);
            }

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    const handleDelete = (aspirationId) => {
        setAspirationToDelete(aspirationId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
    if (aspirationToDelete) {
        setIsDeleting(true);
        router.post(route('admin.aspiration.destroy', aspirationToDelete), {
            // _method: 'DELETE', // method spoofing
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNotificationMessage('Aspirasi berhasil dihapus!');
                setNotificationType('success');
                setShowNotification(true);
                setIsDeleting(false);
                setShowDeleteModal(false);
                setAspirationToDelete(null);
            },
            onError: (errors) => {
                console.error('Error deleting aspiration:', errors);
                setNotificationMessage('Gagal menghapus aspirasi: ' + (errors.error || 'Terjadi kesalahan.'));
                setNotificationType('error');
                setShowNotification(true);
                setIsDeleting(false);
                setShowDeleteModal(false);
                setAspirationToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }
};


    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAspirationToDelete(null);
    };

    const handleViewDetail = (aspirationId) => {
        router.get(route('admin.aspiration.show', aspirationId), {}, {
            onError: (errors) => {
                console.error('Error navigating to detail:', errors);
                setNotificationMessage('Gagal membuka detail aspirasi. Silakan coba lagi.');
                setNotificationType('error');
                setShowNotification(true);
            },
        });
    };

    const handleToggleAspirationStatus = (status) => {
        router.post(route('admin.aspiration.updateStatus'), { status }, {
            onSuccess: () => {
                setNotificationMessage(status === 'OPEN' ? 'Pendataan aspirasi diaktifkan!' : 'Pendataan aspirasi ditutup!');
                setNotificationType('success');
                setShowNotification(true);
            },
            onError: (errors) => {
                console.error('Error updating aspiration status:', errors);
                setNotificationMessage('Gagal memperbarui status aspirasi: ' + (errors.error || 'Terjadi kesalahan.'));
                setNotificationType('error');
                setShowNotification(true);
            },
        });
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Kelola Aspirasi" />

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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                            Konfirmasi Penghapusan
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Apakah Anda yakin ingin menghapus aspirasi ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                disabled={isDeleting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                                disabled={isDeleting}
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Manajemen Aspirasi
                            </h1>
                            <p className="text-gray-500 mt-1">Kelola aspirasi yang dikirim oleh pengguna</p>
                        </div>
                        <div className="flex gap-3">
                            {mpm && (
                                mpm.aspiration_status === 'OPEN' ? (
                                    <button
                                        onClick={() => handleToggleAspirationStatus('CLOSED')}
                                        className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-2.5 rounded-lg hover:from-red-700 hover:to-rose-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                                    >
                                        <FaPowerOff className="w-5 h-5" />
                                        Tutup Pendataan Aspirasi
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggleAspirationStatus('OPEN')}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                                    >
                                        <FaPowerOff className="w-5 h-5" />
                                        Aktifkan Pendataan Aspirasi
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabel Aspirasi */}
                {aspirations.data.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Cerita
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Gambar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Tanggal Dibuat
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {aspirations.data.map((aspiration) => (
                                    <tr
                                        key={aspiration.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {aspiration.category?.name || 'Tidak Ada Kategori'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span title={aspiration.story}>
                                                {truncateText(aspiration.story, 30)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {aspiration.image ? (
                                                <img
                                                    src={`/storage/${aspiration.image}`}
                                                    alt="Aspiration Image"
                                                    className="h-12 w-12 object-cover rounded-md shadow-sm"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            'https://via.placeholder.com/48?text=Gambar+Tidak+Tersedia';
                                                        console.log(
                                                            'Failed to load image:',
                                                            `/storage/${aspiration.image}`
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-gray-500">Tidak Ada Gambar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(aspiration.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetail(aspiration.id)}
                                                className="text-blue-600 hover:text-blue-700 transition mr-4"
                                            >
                                                Lihat Detail
                                            </button>
                                            <button
                                                onClick={() => handleDelete(aspiration.id)}
                                                className="text-red-600 hover:text-red-700 transition"
                                                disabled={isDeleting}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Tidak ada aspirasi yang tersedia
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            Belum ada aspirasi yang dikirimkan oleh pengguna.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {aspirations.data.length > 0 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                        {aspirations.links.map((link, index) => {
                            if (link.label.includes('Previous')) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`p-2 rounded-full ${
                                            link.url
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        } transition-all duration-200 shadow-md`}
                                        disabled={!link.url}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                );
                            } else if (link.label.includes('Next')) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`p-2 rounded-full ${
                                            link.url
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        } transition-all duration-200 shadow-md`}
                                        disabled={!link.url}
                                    >
                                        <FaChevronRight />
                                    </button>
                                );
                            } else {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-4 py-2 rounded-lg shadow-md ${
                                            link.active
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } transition-all duration-200`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}