import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

export default function Index({ auth, permissions, userRole, menu, metas }) {
    const { flash } = usePage().props;
    const [notification, setNotification] = useState({
        show: false,
        type: '',
        message: '',
    });
    const [selectedImage, setSelectedImage] = useState(null); // State untuk modal gambar
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State untuk modal konfirmasi hapus
    const [metaIdToDelete, setMetaIdToDelete] = useState(null); // State untuk menyimpan ID meta yang akan dihapus

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

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setNotification({ show: false, type: '', message: '' });
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    const handleDeleteClick = (id) => {
        setMetaIdToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (metaIdToDelete) {
            router.post(route('admin.meta.destroy', metaIdToDelete), {}, {
                onSuccess: () => {
                    setNotification({
                        show: true,
                        type: 'success',
                        message: 'Meta berhasil dihapus!',
                    });
                },
                onError: () => {
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal menghapus meta. Silakan coba lagi.',
                    });
                },
                onFinish: () => {
                    setShowDeleteModal(false);
                    setMetaIdToDelete(null);
                },
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setMetaIdToDelete(null);
    };

    const handleToggleActive = (id, isActive) => {
        router.post(route('admin.meta.toggle-active', id), { is_active: !isActive }, {
            onSuccess: () => {
                setNotification({
                    show: true,
                    type: 'success',
                    message: `Meta berhasil ${!isActive ? 'diaktifkan' : 'dinonaktifkan'}!`,
                });
            },
            onError: () => {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal mengubah status meta. Silakan coba lagi.',
                });
            },
        });
    };

    const isImageFile = (filePath) => {
        return filePath && /\.(png|jpg|jpeg)$/i.test(filePath);
    };

    const isPDFFile = (filePath) => {
        return filePath && /\.pdf$/i.test(filePath);
    };

    const openImageModal = (filePath) => {
        setSelectedImage(`/storage/${filePath}`);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Daftar Meta" />

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

            {/* Modal untuk konfirmasi penghapusan */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Konfirmasi Penghapusan</h3>
                        <p className="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus meta ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal untuk melihat gambar lebih jelas */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={closeImageModal}>
                    <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 text-white bg-red-600 rounded-full p-2 hover:bg-red-700 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Enlarged Meta File"
                            className="max-w-full max-h-[80vh] object-contain"
                            onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat klik gambar
                        />
                    </div>
                </div>
            )}

            <div className="py-12 max-w-7xl mx-auto px-6 sm:px-8">
                {/* Styled Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Daftar Meta
                        </h1>
                        <p className="text-gray-500 mt-1">Kelola data meta</p>
                    </div>
                    <Link
                        href={route('admin.meta.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                    >
                        Tambah Meta
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Meta Key
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Meta Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Meta Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dibuat Oleh
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {metas.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada data meta.
                                    </td>
                                </tr>
                            ) : (
                                metas.map((meta) => (
                                    <tr key={meta.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meta.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meta.meta_key}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meta.meta_title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div
                                                className="line-clamp-2 ql-editor"
                                                dangerouslySetInnerHTML={{ __html: meta.meta_description }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {meta.file_path ? (
                                                isImageFile(meta.file_path) ? (
                                                    <img
                                                        src={`/storage/${meta.file_path}`}
                                                        alt="Meta File"
                                                        className="h-12 w-12 object-cover rounded-md cursor-pointer"
                                                        onClick={() => openImageModal(meta.file_path)}
                                                    />
                                                ) : isPDFFile(meta.file_path) ? (
                                                    <a
                                                        href={`/storage/${meta.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Lihat PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">File tidak didukung</span>
                                                )
                                            ) : (
                                                <span className="text-gray-500">Tidak ada file</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button
                                                onClick={() => handleToggleActive(meta.id, meta.is_active)}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    meta.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {meta.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {meta.creator?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('admin.meta.edit', meta.id)}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(meta.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}