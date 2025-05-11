import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
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

    const categoryList = ['Semua', ...categories.map(cat => cat.category_name)];
    const itemsPerPage = 4;

    // Ambil data dari API saat komponen dimuat
    useEffect(() => {
        fetch('http://localhost:8000/api/news')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal mengambil data berita');
                }
                return response.json();
            })
            .then(data => {
                console.log('Data Berita dari API:', data);
                // Pastikan data adalah array
                const newsArray = Array.isArray(data) ? data : data.data || [];
                setNewsItems(newsArray);
            })
            .catch(error => {
                console.error('Error fetching news:', error);
                setError('Gagal memuat berita. Silakan coba lagi nanti.');
            });

        fetch('http://localhost:8000/api/news-categories')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal mengambil data kategori');
                }
                return response.json();
            })
            .then(data => {
                console.log('Data Kategori dari API:', data);
                setCategories(data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                setError('Gagal memuat kategori. Silakan coba lagi nanti.');
            });
    }, []);

    // Set featured news dan sidebar news setelah newsItems berubah
    useEffect(() => {
        if (newsItems.length > 0) {
            const featured = newsItems.find(news => news.isFeatured) || 
                            (newsItems.length > 0 ? {...newsItems[0], isFeatured: true} : null);
            setFeaturedNews(featured);

            const sidebarItems = [...newsItems]
                .filter(news => news.news_id !== (featured?.news_id || 0))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
            setSidebarNews(sidebarItems);
        }
    }, [newsItems]);

    // Filter news based on search and category
    const filteredNews = Array.isArray(newsItems) ? newsItems.filter((news) => {
        const matchesSearch =
            news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            news.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === 'Semua' ||
            categories.find(cat => cat.category_id === news.category_id)?.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    }) : [];

    // Pagination logic
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Format date helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
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
            height: '500px',
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
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title="Berita" />

            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Tampilkan pesan error jika ada */}
                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

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
                    {featuredNews && (
                        <div style={styles.heroSection}>
                            <div style={styles.heroMain}>
                                <img
                                    style={styles.heroMainImg}
                                    src={featuredNews.image ? `/storage/${featuredNews.image}` : 'https://via.placeholder.com/800x400'}
                                    alt={featuredNews.title}
                                />
                                <div style={styles.heroMainCategory}>
                                    {categories.find(cat => cat.category_id === featuredNews.category_id)?.category_name || 'Uncategorized'}
                                </div>
                                <div style={styles.heroMainTitle}>{featuredNews.title}</div>
                            </div>
                            <div style={styles.heroSidebar}>
                                {sidebarNews.map((news) => (
                                    <Link key={news.news_id} href={route('news.show', news.news_id)} style={{ textDecoration: 'none' }}>
                                        <div style={styles.heroSidebarNewsCard}>
                                            <img
                                                style={styles.heroSidebarNewsCardImg}
                                                src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/400x150'}
                                                alt={news.title}
                                            />
                                            <div style={styles.heroSidebarNewsCardCategory}>
                                                {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                            </div>
                                            <div style={styles.heroSidebarNewsCardTitle}>{news.title}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* News Grid */}
                    <div style={styles.newsGrid}>
                        {paginatedNews.length > 0 ? (
                            paginatedNews.map((news) => (
                                <Link 
                                key={news.news_id} href={route('news.show', news.news_id)} style={{ textDecoration: 'none' }}>
                                    <div style={styles.newsCard}>
                                        <img
                                            style={styles.newsCardImg}
                                            src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/300x150'}
                                            alt={news.title}
                                        />
                                        <div style={styles.newsCardCategory}>
                                            {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                        </div>
                                        <div style={styles.newsCardTitle}>{news.title}</div>
                                        <div style={styles.newsCardDescription}>
                                            {news.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'}
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
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}