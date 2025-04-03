import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Announcement() {
    const [announcements, setAnnouncements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ambil data dari API saat komponen dimuat
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Ambil daftar pengumuman
                const announcementsResponse = await fetch('http://localhost:8000/api/announcements');
                if (!announcementsResponse.ok) {
                    throw new Error('Gagal mengambil data pengumuman');
                }
                const announcementsData = await announcementsResponse.json();
                setAnnouncements(announcementsData.data || []);

                // Ambil daftar kategori
                const categoriesResponse = await fetch('http://localhost:8000/api/announcement-categories');
                if (!categoriesResponse.ok) {
                    throw new Error('Gagal mengambil data kategori');
                }
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter pengumuman berdasarkan search term dan kategori
    const filteredAnnouncements = announcements.filter(item => {
        if (!item) return false;
        const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory === 'Semua' || 
                             item.category?.category_name === selectedCategory;
        return titleMatch && categoryMatch;
    });

    // Helper function untuk mendapatkan ID
    const getItemId = (item) => {
        if (!item) return null;
        return item.announcement_id || item.id;
    };

    // Helper function untuk menentukan tipe file dan menampilkan dengan benar
    const renderFilePreview = (item) => {
        if (!item || (!item.file && !item.image)) {
            return (
                <div style={styles.listItemImg} className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm">Tidak ada file</span>
                </div>
            );
        }

        const filePath = item.file || item.image;
        if (!filePath) {
            return (
                <div style={styles.listItemImg} className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm">Tidak ada file</span>
                </div>
            );
        }

        if (filePath.toLowerCase().endsWith('.pdf')) {
            return (
                <a
                    href={`/storage/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800 transition-colors duration-200"
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
            return (
                <img
                    src={`/storage/${filePath}`}
                    alt={item?.title || 'Gambar pengumuman'}
                    style={styles.listItemImg}
                    onError={(e) => {
                        e.target.outerHTML = `
                            <div style="${Object.entries(styles.listItemImg).map(([key, value]) => `${key}: ${value}`).join(';')}" class="flex flex-col items-center justify-center text-gray-500">
                                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                                </svg>
                                <span class="mt-2 text-sm">Gambar gagal dimuat</span>
                            </div>
                        `;
                    }}
                />
            );
        }

        return (
            <a
                href={`/storage/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800 transition-colors duration-200"
                style={styles.listItemImg}
            >
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="mt-2 text-sm">Lihat File</span>
            </a>
        );
    };

    // Fungsi untuk mendapatkan style responsif
    const getResponsiveStyles = () => {
        const width = window.innerWidth;
        return {
            body: {
                fontFamily: "'Inter', sans-serif",
                margin: 0,
                padding: 0,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
            },
            container: {
                maxWidth: '1200px',
                margin: '0 auto',
                padding: width <= 768 ? '10px' : '20px',
            },
            searchFilterContainer: {
                marginBottom: '20px',
                padding: width <= 768 ? '10px' : '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                flexWrap: 'wrap',
                backdropFilter: 'blur(10px)',
            },
            searchInput: {
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: width <= 480 ? '14px' : '16px',
                minWidth: '200px',
                width: width <= 480 ? '100%' : 'auto',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                outline: 'none',
            },
            searchInputFocus: {
                borderColor: '#007bff',
                boxShadow: '0 0 8px rgba(0, 123, 255, 0.2)',
            },
            filterSelect: {
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: width <= 480 ? '14px' : '16px',
                minWidth: '150px',
                width: width <= 480 ? '100%' : 'auto',
                transition: 'border-color 0.3s',
                outline: 'none',
            },
            filterSelectFocus: {
                borderColor: '#007bff',
            },
            listContainer: {
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
            },
            listItem: {
                display: 'flex',
                alignItems: 'center',
                padding: width <= 768 ? '15px' : '20px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                background: 'linear-gradient(90deg, #ffffff 0%, #f9f9f9 100%)',
                flexDirection: width <= 480 ? 'column' : 'row',
                gap: width <= 480 ? '15px' : '0',
            },
            listItemHover: {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(90deg, #f9f9f9 0%, #ffffff 100%)',
            },
            listItemImg: {
                width: width <= 480 ? '100%' : '200px',
                height: width <= 480 ? '150px' : '120px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginRight: width <= 480 ? '0' : '20px',
                transition: 'transform 0.3s',
            },
            listItemImgHover: {
                transform: 'scale(1.05)',
            },
            listItemContent: {
                flex: 1,
                textAlign: width <= 480 ? 'center' : 'left',
            },
            listItemCategory: {
                background: 'linear-gradient(45deg, #007bff, #00c4ff)',
                color: '#fff',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: width <= 480 ? '10px' : '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '10px',
            },
            listItemTitle: {
                fontSize: width <= 768 ? '16px' : '18px',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#2d3748',
                transition: 'color 0.3s',
            },
            listItemTitleHover: {
                color: '#007bff',
            },
            listItemDescription: {
                fontSize: width <= 768 ? '12px' : '14px',
                color: '#718096',
                marginBottom: '10px',
                lineHeight: '1.5',
            },
            listItemLink: {
                color: '#007bff',
                textDecoration: 'none',
                fontSize: width <= 768 ? '12px' : '14px',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(0, 123, 255, 0.1)',
                transition: 'background 0.3s, color 0.3s',
                display: 'inline-block',
            },
            listItemLinkHover: {
                background: '#007bff',
                color: '#fff',
            },
            emptyState: {
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
            },
            emptyStateTitle: {
                fontSize: '20px',
                fontWeight: '500',
                color: '#4a4a4a',
                marginBottom: '10px',
            },
            emptyStateText: {
                color: '#718096',
                fontSize: '16px',
            },
            loadingState: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
            },
            errorMessage: {
                textAlign: 'center',
                color: '#e53e3e',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px',
            },
        };
    };

    // State untuk menyimpan styles responsif
    const [styles, setStyles] = useState(getResponsiveStyles());

    // Update styles saat ukuran layar berubah
    useEffect(() => {
        const handleResize = () => {
            setStyles(getResponsiveStyles());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <GuestLayout>
            <NavbarGuestLayout />
            <Head title="Pengumuman" />
            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Search and Filter Section */}
                    <div style={styles.searchFilterContainer}>
                        <input
                            type="text"
                            style={styles.searchInput}
                            placeholder="Cari pengumuman..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={(e) => {
                                e.target.style.borderColor = styles.searchInputFocus.borderColor;
                                e.target.style.boxShadow = styles.searchInputFocus.boxShadow;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#ddd';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <select
                            style={styles.filterSelect}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            onFocus={(e) => {
                                e.target.style.borderColor = styles.filterSelectFocus.borderColor;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#ddd';
                            }}
                        >
                            <option value="Semua">Semua Kategori</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_name}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div style={styles.loadingState}>
                            <svg
                                className="animate-spin h-10 w-10 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        </div>
                    ) : (
                        <div style={styles.listContainer}>
                            {filteredAnnouncements.length > 0 ? (
                                filteredAnnouncements.map((item) => {
                                    const itemId = getItemId(item);
                                    if (!itemId) return null;
                                    return (
                                        <Link
                                            key={itemId}
                                            href={`/announcement/${itemId}`}
                                            style={{ textDecoration: 'none' }}
                                            onClick={() => console.log('Navigating to announcement detail with ID:', itemId)}
                                        >
                                            <div
                                                style={styles.listItem}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = styles.listItemHover.transform;
                                                    e.currentTarget.style.boxShadow = styles.listItemHover.boxShadow;
                                                    e.currentTarget.style.background = styles.listItemHover.background;
                                                    const img = e.currentTarget.querySelector('img');
                                                    if (img) img.style.transform = styles.listItemImgHover.transform;
                                                    const title = e.currentTarget.querySelector('.announcement-title');
                                                    if (title) title.style.color = styles.listItemTitleHover.color;
                                                    const link = e.currentTarget.querySelector('.announcement-link');
                                                    if (link) {
                                                        link.style.background = styles.listItemLinkHover.background;
                                                        link.style.color = styles.listItemLinkHover.color;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'none';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.background = 'linear-gradient(90deg, #ffffff 0%, #f9f9f9 100%)';
                                                    const img = e.currentTarget.querySelector('img');
                                                    if (img) img.style.transform = 'none';
                                                    const title = e.currentTarget.querySelector('.announcement-title');
                                                    if (title) title.style.color = '#2d3748';
                                                    const link = e.currentTarget.querySelector('.announcement-link');
                                                    if (link) {
                                                        link.style.background = 'rgba(0, 123, 255, 0.1)';
                                                        link.style.color = '#007bff';
                                                    }
                                                }}
                                            >
                                                {renderFilePreview(item)}
                                                <div style={styles.listItemContent}>
                                                    <div style={styles.listItemCategory}>
                                                        {item.category?.category_name || "Uncategorized"}
                                                    </div>
                                                    <div style={styles.listItemTitle} className="announcement-title">
                                                        {item.title || 'Tanpa Judul'}
                                                    </div>
                                                    <div style={styles.listItemDescription}>
                                                        {(item.content || '').replace(/<[^>]+>/g, '').substring(0, 150) + '...'}
                                                    </div>
                                                    <div
                                                        style={styles.listItemLink}
                                                        className="announcement-link"
                                                    >
                                                        Baca Selengkapnya
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div style={styles.emptyState}>
                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <h3 style={styles.emptyStateTitle}>
                                        Tidak ada pengumuman
                                    </h3>
                                    <p style={styles.emptyStateText}>
                                        {searchTerm ? "Tidak ada hasil yang cocok dengan pencarian Anda" : "Belum ada pengumuman yang ditambahkan"}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}