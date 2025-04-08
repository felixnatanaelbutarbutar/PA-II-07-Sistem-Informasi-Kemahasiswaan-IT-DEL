import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
                <h1 className="text-2xl font-bold mb-4">Kelola Aspirasi</h1>

                {aspirations.data.length === 0 ? (
                    <p className="text-gray-500">Belum ada aspirasi yang dikirimkan.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 border-b text-left">Pengirim</th>
                                    <th className="px-4 py-2 border-b text-left">Cerita</th>
                                    <th className="px-4 py-2 border-b text-left">Nomor Telepon</th>
                                    <th className="px-4 py-2 border-b text-left">Tanggal Dibuat</th>
                                    <th className="px-4 py-2 border-b text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aspirations.data.map((aspiration) => (
                                    <tr key={aspiration.id}>
                                        <td className="px-4 py-2 border-b">{aspiration.user.name}</td>
                                        <td className="px-4 py-2 border-b">
                                            <span title={aspiration.story}>
                                                {truncateText(aspiration.story, 30)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border-b">{aspiration.noTelephone}</td>
                                        <td className="px-4 py-2 border-b">
                                            {new Date(aspiration.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <button
                                                onClick={() => handleViewDetail(aspiration.id)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 text-sm"
                                            >
                                                Lihat Detail
                                            </button>
                                            <button
                                                onClick={() => handleDelete(aspiration.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                    {aspirations.links.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => link.url && router.get(link.url)}
                            className={`px-3 py-1 mx-1 rounded ${link.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>

                {/* Modal Konfirmasi Hapus */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-bold mb-4">Konfirmasi Hapus</h2>
                            <p className="mb-4">Apakah Anda yakin ingin menghapus aspirasi ini?</p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={cancelDelete}
                                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
