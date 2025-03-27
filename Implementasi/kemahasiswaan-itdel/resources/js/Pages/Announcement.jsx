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

        // Fallback for direct requests
        if (window.history.state && !window.history.state.inertia) {
            window.location.reload();
        }
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
        console.log("Rendering item:", item?.title, item);

        if (!item || (!item.file && !item.image)) {
            console.log("No file for item:", item?.title);
            return (
                <img
                    src="/images/placeholder.png"
                    alt="Placeholder"
                    style={styles.listItemImg}
                />
            );
        }

        const filePath = item.file || item.image;
        console.log("File path for item:", item?.title, filePath);

        if (!filePath) {
            console.log("File path is empty for item:", item?.title);
            return (
                <img
                    src="/images/placeholder.png"
                    alt="Placeholder"
                    style={styles.listItemImg}
                />
            );
        }

        if (filePath.toLowerCase().endsWith('.pdf')) {
            console.log("Rendering PDF for item:", item?.title, filePath);
            return (
                <a
                    href={`/storage/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800"
                    style={styles.listItemImg}
                >
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm">Lihat PDF</span>
                </a>
            );
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const isImage = imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
        if (isImage) {
            console.log("Rendering image for item:", item?.title, filePath);
            return (
                <img
                    src={`/storage/${filePath}`}
                    alt={item?.title || 'Gambar pengumuman'}
                    style={styles.listItemImg}
                    onError={(e) => {
                        console.log("Image gagal dimuat:", filePath);
                        e.target.src = "/images/placeholder.png";
                    }}
                />
            );
        }

        console.log("Rendering fallback for unsupported file:", item?.title, filePath);
        return (
            <a
                href={`/storage/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800"
                style={styles.listItemImg}
            >
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="mt-2 text-sm">Lihat File</span>
            </a>
        );
    };

    const styles = {
        body: {
            fontFamily: 'Arial, sans-serif',
            margin: 0,
            padding: 0,
            backgroundColor: '#f5f7fa',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
        },
        searchFilterContainer: {
            marginBottom: '20px',
            padding: '20px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
        },
        searchInput: {
            width: '50%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px',
        },
        listContainer: {
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
        },
        listItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #eee',
            transition: 'background 0.3s',
        },
        listItemHover: {
            background: '#f9f9f9',
        },
        listItemImg: {
            width: '200px',
            height: '120px',
            objectFit: 'cover',
            borderRadius: '5px',
            marginRight: '20px',
        },
        listItemContent: {
            flex: 1,
        },
        listItemCategory: {
            background: '#e6f0fa',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '10px',
        },
        listItemTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
        },
        listItemDescription: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '10px',
        },
        listItemLink: {
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '14px',
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
    };

    return (
        <GuestLayout>
            <NavbarGuestLayout />
            <Head title="Pengumuman" />
            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Search Bar */}
                    <div style={styles.searchFilterContainer}>
                        <input
                            type="text"
                            style={styles.searchInput}
                            placeholder="Cari pengumuman..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Debugging Info - hapus di lingkungan produksi */}
                    {(!announcement || announcement.length === 0) && (
                        <div style={{ background: '#fefcbf', borderLeft: '4px solid #f6e05e', color: '#b7791f', padding: '16px', marginBottom: '24px' }}>
                            <p style={{ fontWeight: 'bold' }}>Tidak ada data</p>
                            <p>Tidak ada data pengumuman yang diterima dari server.</p>
                        </div>
                    )}

                    {/* Announcement List */}
                    <div style={styles.listContainer}>
                        {filteredAnnouncement.length > 0 ? (
                            filteredAnnouncement.map((item) => {
                                const itemId = getItemId(item);
                                if (!itemId) return null;
                                return (
                                    <a
                                        key={itemId}
                                        href={`/announcement/${itemId}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div
                                            style={styles.listItem}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = styles.listItemHover.background)}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            {renderFilePreview(item)}
                                            <div style={styles.listItemContent}>
                                                <div style={styles.listItemCategory}>
                                                    {item.category?.category_name || "Uncategorized"}
                                                </div>
                                                <div style={styles.listItemTitle}>
                                                    {item.title || 'Tanpa Judul'}
                                                </div>
                                                <div style={styles.listItemDescription}>
                                                    {(item.content || '').replace(/<[^>]+>/g, '').substring(0, 150) + '...'}
                                                </div>
                                                <div style={styles.listItemLink}>
                                                    Baca Selengkapnya
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div style={styles.emptyState}>
                                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#4a4a4a', marginBottom: '10px' }}>
                                    Tidak ada pengumuman
                                </h3>
                                <p style={{ color: '#666' }}>
                                    {searchTerm ? "Tidak ada hasil yang cocok dengan pencarian Anda" : "Belum ada pengumuman yang ditambahkan"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}