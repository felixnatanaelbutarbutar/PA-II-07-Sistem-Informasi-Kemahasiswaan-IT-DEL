import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaEye, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Tambahkan ikon dari react-icons

export default function AspirationIndex({ auth, userRole, permissions, menu, aspirations }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [aspirationToDelete, setAspirationToDelete] = useState(null);

    const handleDelete = (aspirationId) => {
        setAspirationToDelete(aspirationId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (aspirationToDelete) {
            router.delete(route('admin.aspiration.destroy', aspirationToDelete), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setAspirationToDelete(null);
                },
                onError: (errors) => {
                    console.error('Error deleting aspiration:', errors);
                    alert('Gagal menghapus aspirasi. Silakan coba lagi.');
                    setShowDeleteModal(false);
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
                alert('Gagal membuka detail aspirasi. Silakan coba lagi.');
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
            menu={menu}
        >
            <Head title="Kelola Aspirasi" />

            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Kelola Aspirasi</h1>

                {aspirations.data.length === 0 ? (
                    <p className="text-gray-500 text-lg">Belum ada aspirasi yang dikirimkan.</p>
                ) : (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Pengirim</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Cerita</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Gambar</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tanggal Dibuat</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {aspirations.data.map((aspiration) => (
                                    <tr
                                        key={aspiration.id}
                                        className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 text-gray-700">
                                            {aspiration.user?.name || 'Anonim'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {aspiration.category?.name || 'Tidak Ada Kategori'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
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
                                                        e.target.src = 'https://via.placeholder.com/48?text=Gambar+Tidak+Tersedia';
                                                        console.log('Failed to load image:', `/storage/${aspiration.image}`);
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-gray-500">Tidak Ada Gambar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {new Date(aspiration.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => handleViewDetail(aspiration.id)}
                                                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm text-sm"
                                            >
                                                <FaEye /> Lihat Detail
                                            </button>
                                            <button
                                                onClick={() => handleDelete(aspiration.id)}
                                                className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm text-sm"
                                            >
                                                <FaTrash /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                        className={`p-2 rounded-full ${link.url
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            } transition-all duration-200`}
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
                                        className={`p-2 rounded-full ${link.url
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            } transition-all duration-200`}
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
                                        className={`px-4 py-2 rounded-lg ${link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            } transition-all duration-200`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }
                        })}
                    </div>
                )}

                {/* Modal Konfirmasi Hapus */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
                        <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all duration-300 scale-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Hapus</h2>
                            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus aspirasi ini?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
