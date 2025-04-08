import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ auth, userRole, permissions, menu, aspiration }) {
    const [showFullStory, setShowFullStory] = useState(false);

    // Fungsi untuk memotong teks
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
            <Head title="Detail Aspirasi" />

            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Detail Aspirasi</h1>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Pengirim</h2>
                        <p className="text-gray-700">{aspiration.user.name}</p>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Cerita Aspirasi</h2>
                        <p
                            className="text-gray-700 whitespace-pre-wrap max-w-5x2 break-words"
                            style={{ wordBreak: 'break-all' }}
                        >
                            {showFullStory ? (
                                aspiration.story
                            ) : (
                                <span title={aspiration.story}>
                                    {truncateText(aspiration.story, 100)}
                                </span>
                            )}
                        </p>
                        {aspiration.story.length > 100 && (
                            <button
                                onClick={() => setShowFullStory(!showFullStory)}
                                className="text-blue-500 hover:underline text-sm mt-2"
                            >
                                {showFullStory ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                            </button>
                        )}
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Nomor Telepon</h2>
                        <p className="text-gray-700">{aspiration.noTelephone}</p>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Tanggal Dibuat</h2>
                        <p className="text-gray-700">
                            {new Date(aspiration.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Tanggal Diperbarui</h2>
                        <p className="text-gray-700">
                            {new Date(aspiration.updated_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                    <div>
                        <Link
                            href={route('admin.aspiration.index')}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
