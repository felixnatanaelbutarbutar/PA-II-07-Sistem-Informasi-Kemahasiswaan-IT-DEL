import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Announcement() {
    const props = usePage().props;
    const announcement = props.announcement || [];
    const [searchTerm, setSearchTerm] = useState("");

    // Debugging props yang diterima
    useEffect(() => {
        console.log("Props lengkap:", props);
        console.log("Panjang array pengumuman:", announcement.length);
        console.log("Item pertama jika ada:", announcement[0]);
    }, [announcement, props]);

    // Filter pengumuman berdasarkan search term
    const filteredAnnouncement = announcement.filter(item => {
        if (!item) return false;
        const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = item.category?.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || categoryMatch;
    });

    // Helper function untuk mendapatkan ID dengan lebih konsisten
    const getItemId = (item) => {
        if (!item) return null;
        return item.announcement_id || item.id;
    };

    // Helper function untuk menentukan tipe file dan menampilkan dengan benar
    const renderFilePreview = (item) => {
        // Debugging: Log item untuk memastikan data
        console.log("Rendering item:", item.title, item);

        // Jika tidak ada item atau tidak ada file
        if (!item || (!item.file && !item.image)) {
            console.log("No file for item:", item.title);
            return <span className="text-gray-500">Tidak ada file</span>;
        }

        // Ambil file path
        const filePath = item.file || item.image;
        console.log("File path for item:", item.title, filePath);

        // Jika file path kosong
        if (!filePath) {
            console.log("File path is empty for item:", item.title);
            return <span className="text-gray-500">Tidak ada file</span>;
        }

        // Cek apakah ini PDF
        if (filePath.toLowerCase().endsWith('.pdf')) {
            console.log("Rendering PDF for item:", item.title, filePath);
            return (
                <a
                    href={`/storage/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800"
                >
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2">Lihat PDF</span>
                </a>
            );
        }

        // Cek apakah ini gambar yang didukung
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const isImage = imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
        if (isImage) {
            console.log("Rendering image for item:", item.title, filePath);
            return (
                <img
                    src={`/storage/${filePath}`}
                    alt={item.title || 'Gambar pengumuman'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.log("Image gagal dimuat:", filePath);
                        e.target.src = "/images/placeholder.png";
                    }}
                />
            );
        }

        // Fallback untuk file yang tidak didukung (bukan gambar atau PDF)
        console.log("Rendering fallback for unsupported file:", item.title, filePath);
        return (
            <a
                href={`/storage/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800"
            >
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="mt-2">Lihat File</span>
            </a>
        );
    };

    return (
        <GuestLayout>
            <NavbarGuestLayout></NavbarGuestLayout>

            <Head title="Pengumuman" />

            <div className="py-10 max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Pengumuman</h1>

                {/* Search Bar */}
                <div className="relative flex justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Cari pengumuman..."
                        className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Debugging Info - hapus di lingkungan produksi */}
                {(!announcement || announcement.length === 0) && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                        <p className="font-bold">Tidak ada data</p>
                        <p>Tidak ada data pengumuman yang diterima dari server.</p>
                    </div>
                )}

                {/* Pengumuman List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAnnouncement.map((item) => {
                        const itemId = getItemId(item);
                        if (!itemId) return null;

                        return (
                            <div key={itemId} className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                                {/* Display Image or PDF */}
                                <div className="h-52 overflow-hidden relative flex items-center justify-center bg-gray-100">
                                    {renderFilePreview(item)}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{item.title || 'Tanpa Judul'}</h2>
                                    <p className="text-gray-500 text-sm mb-3">{item.category?.category_name || "Uncategorized"}</p>
                                    <div className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow" dangerouslySetInnerHTML={{ __html: item.content || '' }}></div>
                                    <a
                                        href={`/announcement/${itemId}`}
                                        className="text-blue-600 hover:underline mt-auto inline-block"
                                    >
                                        Baca Selengkapnya
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredAnnouncement.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-700 mb-1">Tidak ada pengumuman</h3>
                        <p className="text-gray-500">
                            {searchTerm ? "Tidak ada hasil yang cocok dengan pencarian Anda" : "Belum ada pengumuman yang ditambahkan"}
                        </p>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
