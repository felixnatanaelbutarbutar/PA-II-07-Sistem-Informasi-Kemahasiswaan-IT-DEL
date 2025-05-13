import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function News() {
    const [newsItems, setNewsItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [featuredNews, setFeaturedNews] = useState(null);
    const [sidebarNews, setSidebarNews] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const categoryList = ['Semua', ...categories.map(cat => cat.category_name)];
    const itemsPerPage = 4;

    // Ambil data dari API saat komponen dimuat
    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/news');
                if (!response.ok) {
                    throw new Error('Gagal mengambil data berita');
                }
                const data = await response.json();
                const newsArray = Array.isArray(data.data) ? data.data : data || [];
                setNewsItems(newsArray);
            } catch (error) {
                console.error('Error fetching news:', error);
                setError('Gagal memuat berita. Silakan coba lagi nanti.');
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/news-categories');
                if (!response.ok) {
                    throw new Error('Gagal mengambil data kategori');
                }
                const data = await response.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Gagal memuat kategori. Silakan coba lagi nanti.');
            }
        };

        Promise.all([fetchNews(), fetchCategories()])
            .finally(() => setIsLoading(false));
    }, []);

    // Set featured news dan sidebar news setelah newsItems berubah
    useEffect(() => {
        if (newsItems.length > 0) {
            // Urutkan berdasarkan created_at (terbaru ke terlama)
            const sortedNews = [...newsItems].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Featured news: berita terbaru (pertama setelah diurutkan)
            const featured = sortedNews[0];
            setFeaturedNews(featured);

            // Sidebar news: 2 berita terbaru setelah featured news
            const sidebarItems = sortedNews.slice(1, 3); // Ambil 2 berita setelah featured
            setSidebarNews(sidebarItems);
        }
    }, [newsItems]);

    // Filter news untuk NewsGrid, kecualikan yang sudah ditampilkan di HeroMain dan HeroSidebar
    const displayedNewsIds = [
        featuredNews?.news_id,
        ...sidebarNews.map(news => news.news_id)
    ].filter(id => id);

    const filteredNews = Array.isArray(newsItems) ? newsItems.filter((news) => {
        if (!news.news_id) return false;
        const matchesSearch =
            (news.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
            (news.content?.toLowerCase().includes(searchQuery.toLowerCase()) || '');
        const matchesCategory =
            selectedCategory === 'Semua' ||
            categories.find(cat => cat.category_id === news.category_id)?.category_name === selectedCategory;
        const isNotDisplayed = !displayedNewsIds.includes(news.news_id);
        return matchesSearch && matchesCategory && isNotDisplayed;
    }) : [];

    // Pagination logic
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Format date helper
    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('id-ID', options);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Tanggal tidak valid';
        }
    };
    
    const styles = {
        body: {
            fontFamily: 'Arial, sans-serif',
            margin: 0,
            padding: 0,
            backgroundColor: '#f5f7fa',
        },
        container: {
            maxWidth: '1500px',
            margin: '0 auto',
            padding: '20px',
        },
        heroSection: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
        },
        heroMain: {
            flex: 2,
            position: 'relative',
            background: '#fff',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        heroMainImg: {
            width: '100%',
            height: '580px',
            objectFit: 'cover',
        },
        heroMainCategory: {
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#fff9db',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        heroMainTitle: {
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            color: '#000',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
        },
        heroSidebar: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        heroSidebarNewsCard: {
            background: '#fff',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        heroSidebarNewsCardImg: {
            width: '100%',
            height: '150px',
            objectFit: 'cover',
        },
        heroSidebarNewsCardCategory: {
            background: '#e6f0fa',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            margin: '10px',
        },
        heroSidebarNewsCardTitle: {
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 10px 10px',
        },
        newsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
        },
        newsCard: {
            background: '#fff',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        newsCardImg: {
            width: '100%',
            height: '200px',
            objectFit: 'cover',
        },
        newsCardCategory: {
            background: '#e6f0fa',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            margin: '10px',
        },
        newsCardTitle: {
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 10px 10px',
        },
        newsCardDescription: {
            fontSize: '14px',
            color: '#666',
            margin: '0 10px 10px',
        },
        searchFilterContainer: {
            marginBottom: '20px',
            padding: '20px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
        },
        searchInput: {
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px',
        },
        filterSelect: {
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px',
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
            gap: '10px',
        },
        pageButton: {
            padding: '10px 15px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
        },
        pageButtonActive: {
            background: '#007bff',
            color: '#fff',
            border: '1px solid #007bff',
        },
        pageButtonDisabled: {
            background: '#f0f0f0',
            cursor: 'not-allowed',
        },
        errorMessage: {
            textAlign: 'center',
            color: 'red',
            padding: '20px',
        },
        loadingState: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
        },
    };

    return (
        <GuestLayout>
            <Navbar />
            <Head title="Berita" />

            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Tampilkan pesan error jika ada */}
                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Tampilkan loading state */}
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
                        <>
                            {/* Search and Filter Section */}
                            <div style={styles.searchFilterContainer}>
                                <input
                                    type="text"
                                    style={styles.searchInput}
                                    placeholder="Cari berita..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <select
                                    style={styles.filterSelect}
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categoryList.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hero Section */}
                            {featuredNews ? (
                                <div style={styles.heroSection}>
                                    <Link href={route('news.show', featuredNews.news_id)} style={{ textDecoration: 'none' }}>
                                        <div style={styles.heroMain}>
                                            <img
                                                style={styles.heroMainImg}
                                                src={featuredNews.image ? `/storage/${featuredNews.image}` : 'https://via.placeholder.com/800x400'}
                                                alt={featuredNews.title || 'Berita Utama'}
                                            />
                                            <div style={styles.heroMainCategory}>
                                                {categories.find(cat => cat.category_id === featuredNews.category_id)?.category_name || 'Uncategorized'}
                                            </div>
                                            <div style={styles.heroMainTitle}>{featuredNews.title || 'Judul Tidak Tersedia'}</div>
                                        </div>
                                    </Link>
                                    <div style={styles.heroSidebar}>
                                        {sidebarNews.length > 0 ? sidebarNews.map((news) => (
                                            <Link key={news.news_id} href={route('news.show', news.news_id)} style={{ textDecoration: 'none' }}>
                                                <div style={styles.heroSidebarNewsCard}>
                                                    <img
                                                        style={styles.heroSidebarNewsCardImg}
                                                        src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/400x150'}
                                                        alt={news.title || 'Berita Sidebar'}
                                                    />
                                                    <div style={styles.heroSidebarNewsCardCategory}>
                                                        {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                                    </div>
                                                    <div style={styles.heroSidebarNewsCardTitle}>{news.title || 'Judul Tidak Tersedia'}</div>
                                                </div>
                                            </Link>
                                        )) : (
                                            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                Tidak ada berita sidebar tersedia.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    Tidak ada berita utama tersedia.
                                </div>
                            )}

                            {/* News Grid */}
                            <div style={styles.newsGrid}>
                                {paginatedNews.length > 0 ? (
                                    paginatedNews.map((news) => (
                                        <Link key={news.news_id} href={route('news.show', news.news_id)} style={{ textDecoration: 'none' }}>
                                            <div style={styles.newsCard}>
                                                <img
                                                    style={styles.newsCardImg}
                                                    src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/300x150'}
                                                    alt={news.title || 'Berita'}
                                                />
                                                <div style={styles.newsCardCategory}>
                                                    {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                                </div>
                                                <div style={styles.newsCardTitle}>{news.title || 'Judul Tidak Tersedia'}</div>
                                                <div style={styles.newsCardDescription}>
                                                    {(news.content?.replace(/<[^>]+>/g, '')?.substring(0, 100) || 'Deskripsi tidak tersedia') + '...'}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                                        Tidak ada berita yang ditemukan.
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={styles.pagination}>
                                    <button
                                        style={{
                                            ...styles.pageButton,
                                            ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                                        }}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            style={{
                                                ...styles.pageButton,
                                                ...(currentPage === index + 1 ? styles.pageButtonActive : {}),
                                            }}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        style={{
                                            ...styles.pageButton,
                                            ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                                        }}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}