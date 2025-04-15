import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaUser, FaFolder, FaFileAlt, FaImage, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa'; // Tambahkan ikon dari react-icons

export default function Show({ auth, userRole, permissions, menu, aspiration }) {
    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Detail Aspirasi" />

            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Detail Aspirasi</h1>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 animate-fade-in">
                    {/* Header dengan Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                        <h2 className="text-2xl font-semibold">Informasi Aspirasi</h2>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Pengirim */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                            <FaUser className="text-blue-600 text-xl mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Pengirim</h3>
                                <p className="text-gray-600">{aspiration.user?.name || 'Anonim'}</p>
                            </div>
                        </div>

                        {/* Kategori */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                            <FaFolder className="text-blue-600 text-xl mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Kategori</h3>
                                <p className="text-gray-600">{aspiration.category?.name || 'Tidak Ada Kategori'}</p>
                            </div>
                        </div>

                        {/* Cerita */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                            <FaFileAlt className="text-blue-600 text-xl mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Cerita</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{aspiration.story}</p>
                            </div>
                        </div>

                        {/* Gambar */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                            <FaImage className="text-blue-600 text-xl mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Gambar</h3>
                                {aspiration.image ? (
                                    <img
                                        src={`/storage/${aspiration.image}`}
                                        alt="Aspiration Image"
                                        className="h-48 w-48 object-cover rounded-lg shadow-md mt-2"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/192?text=Gambar+Tidak+Tersedia';
                                            console.log('Failed to load image:', `/storage/${aspiration.image}`);
                                        }}
                                    />
                                ) : (
                                    <p className="text-gray-500">Tidak Ada Gambar</p>
                                )}
                            </div>
                        </div>

                        {/* Tanggal Dibuat */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                            <FaCalendarAlt className="text-blue-600 text-xl mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Tanggal Dibuat</h3>
                                <p className="text-gray-600">
                                    {new Date(aspiration.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Tombol Kembali */}
                        <div className="flex justify-end">
                            <Link
                                href={route('admin.aspiration.index')}
                                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm"
                            >
                                <FaArrowLeft /> Kembali
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
