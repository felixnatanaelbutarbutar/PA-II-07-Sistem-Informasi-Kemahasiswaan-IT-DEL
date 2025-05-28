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
        const [isLoaded, setIsLoaded] = useState(false);

        const categoryList = ['Semua', ...categories.map(cat => cat.category_name)];
        const itemsPerPage = 4;

        // Fetch data from API on component mount
        useEffect(() => {
            const fetchNews = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch('http://157.15.124.200/api/news');
                    if (!response.ok) {
                        throw new Error('Gagal mengambil data berita');
                    }
                    const data = await response.json();
                    const newsArray = Array.isArray(data) ? data : data.data || [];
                    setNewsItems(newsArray);
                    console.log('News data:', newsArray);
                } catch (error) {
                    console.error('Error fetching news:', error);
                    setError('Gagal memuat berita. Silakan coba lagi nanti.');
                }
            };

            const fetchCategories = async () => {
                try {
                    const response = await fetch('http://157.15.124.200/api/news-categories');
                    if (!response.ok) {
                        throw new Error('Gagal mengambil data kategori');
                    }
                    const data = await response.json();
                    setCategories(Array.isArray(data) ? data : []);
                    console.log('Categories data:', data);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setError('Gagal memuat kategori. Silakan coba lagi nanti.');
                }
            };

            Promise.all([fetchNews(), fetchCategories()])
                .finally(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }, []);

        // Set featured and sidebar news with search and category filtering
        useEffect(() => {
            if (newsItems.length > 0) {
                const selectedCategoryId = selectedCategory === 'Semua'
                    ? null
                    : categories.find(cat => cat.category_name === selectedCategory)?.category_id;
                const filteredNews = newsItems.filter(news => {
                    if (!news.news_id || !news.category_id) return false;
                    const matchesCategory = selectedCategory === 'Semua' || news.category_id === selectedCategoryId;
                    const matchesSearch = !searchQuery || (
                        (news.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
                        (news.content?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
                    );
                    return matchesCategory && matchesSearch;
                });
                const sortedNews = [...filteredNews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                const featured = sortedNews[0] || null;
                setFeaturedNews(featured);
                const sidebarItems = sortedNews.slice(1, 3);
                setSidebarNews(sidebarItems);
                console.log('Filtered hero news:', { featured, sidebarItems });
            }
        }, [newsItems, selectedCategory, categories, searchQuery]);

        // Filter news for NewsGrid, excluding HeroMain and HeroSidebar items
        const displayedNewsIds = [
            featuredNews?.news_id,
            ...sidebarNews.map(news => news.news_id)
        ].filter(id => id);

        const filteredNews = Array.isArray(newsItems) ? newsItems.filter((news) => {
            if (!news.news_id || !news.category_id) return false;
            const matchesSearch = !searchQuery || (
                (news.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
                (news.content?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
            );
            const selectedCategoryId = selectedCategory === 'Semua'
                ? null
                : categories.find(cat => cat.category_name === selectedCategory)?.category_id;
            const matchesCategory = selectedCategory === 'Semua' || news.category_id === selectedCategoryId;
            const isNotDisplayed = !displayedNewsIds.includes(news.news_id);
            console.log(`Grid news: ${news.title}, Category ID: ${news.category_id}, Selected: ${selectedCategoryId}, Matches: ${matchesCategory}`);
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


        const formatRole = (role) => {
            if (!role) {
                console.warn('Role is null or undefined, checking creator relation');
                return 'Penulis'; // Default jika role tidak ada
            }
            const roleMap = {
                kemahasiswaan: 'Staf Kemahasiswaan',
                adminbem: 'BEM',
                adminmpm: 'MPM',
                // mahasiswa: 'Mahasiswa',
            };
            return roleMap[role?.toLowerCase()] || role || 'Penulis';
        };

        const styles = {
            body: {
                fontFamily: '"Inter", sans-serif',
                margin: 0,
                padding: 0,
                background: 'linear-gradient(to bottom, #f8fafc, #e5e7eb)',
            },
            container: {
                backgroundColor: '#F5F7FA',
                maxWidth: '1500px', // Disamakan dengan file kedua
                margin: '0 auto',
                padding: '20px', // Disamakan dengan file kedua
            },
            heroSection: {
                display: 'flex',
                gap: '20px', // Disamakan dengan file kedua
                marginBottom: '20px', // Disamakan dengan file kedua
                alignItems: 'flex-start',
                width: '100%',
            },
            heroMain: {
                flex: 2,
                background: '#fff',
                borderRadius: '10px', // Disamakan dengan file kedua
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Disamakan dengan file kedua
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '567px', // Disamakan dengan file kedua
            },
            heroMainImg: {
                width: '100',
                height: '567px', // Disamakan dengan file kedua
                objectFit: 'cover',
                display: 'block',
            },
            heroMainCategory: {
                position: 'absolute',
                top: '20px', // Disamakan dengan file kedua
                left: '20px', // Disamakan dengan file kedua
                background: 'linear-gradient(135deg, #fef9c3, #fef08a)',
                padding: '5px 10px', // Disamakan dengan file kedua
                borderRadius: '5px', // Disamakan dengan file kedua
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
            },
            heroMainTitle: {
                position: 'absolute',
                bottom: '20px', // Disamakan dengan file kedua
                left: '20px', // Disamakan dengan file kedua
                color: '#000',
                fontSize: '24px', // Disamakan dengan file kedua
                fontWeight: 'bold',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '10px', // Disamakan dengan file kedua
                borderRadius: '5px', // Disamakan dengan file kedua
                transition: 'transform 0.2s ease',
            },
            heroMainContent: {
                padding: '12px',
                height: '44px',
            },
            heroMainDescription: {
                fontSize: '14px',
                color: '#4b5563',
                margin: '0',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                lineHeight: '1.4',
                maxHeight: '39.2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            heroSidebar: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px', // Disamakan dengan file kedua
                height: '420px',
            },
            heroSidebarNewsCard: {
                background: '#fff',
                borderRadius: '10px', // Disamakan dengan file kedua
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Disamakan dengan file kedua
                transition: 'transform 0.3s ease',
                position: 'relative',
                flex: 1,
                maxHeight: '300px',
            },
            heroSidebarNewsCardImg: {
                width: '100%',
                height: '150px', // Disamakan dengan file kedua
                objectFit: 'cover',
            },
            heroSidebarNewsCardCategory: {
                position: 'absolute',
                top: '0',
                right: '0',
                background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                padding: '5px 10px', // Disamakan dengan file kedua
                borderRadius: '5px', // Disamakan dengan file kedua
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
            },
            heroSidebarNewsCardTitle: {
                fontSize: '16px',
                fontWeight: '600',
                margin: '8px 12px 4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 4,
                lineHeight: '1.4',
                maxHeight: '89.6px',
            },
            heroSidebarNewsCardMeta: {
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 12px 8px',
                fontWeight: '400',
            },
            sectionDivider: {
                display: 'flex',
                justifyContent: 'center',
                margin: '40px 0',
            },
            sectionDividerLine: {
                width: '80%',
                height: '3px',
                background: 'linear-gradient(to right, transparent, #d1d5db 50%, transparent)',
                border: 'none',
            },
            newsGrid: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Disamakan dengan file kedua
                gap: '20px', // Disamakan dengan file kedua
                marginBottom: '20px', // Disamakan dengan file kedua
            },
            newsCard: {
                background: '#fff',
                borderRadius: '10px', // Disamakan dengan file kedua
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Disamakan dengan file kedua
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative',
            },
            newsCardHover: {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            },
            newsCardDivider: {
                borderTop: '1px solid #e5e7eb',
                margin: '0 12px',
            },
            newsCardImg: {
                width: '100%',
                height: '200px',
                objectFit: 'cover',
            },
            newsCardCategory: {
                position: 'absolute',
                top: '0',
                right: '0',
                background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                padding: '5px 10px', // Disamakan dengan file kedua
                borderRadius: '5px', // Disamakan dengan file kedua
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
            },
            newsCardTitle: {
                fontSize: '16px', // Disamakan dengan file kedua
                fontWeight: '600',
                margin: '0 10px 10px', // Disamakan dengan file kedua
            },
            newsCardMeta: {
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 12px 8px',
                fontWeight: '400',
            },
            newsCardDescription: {
                fontSize: '14px',
                color: '#4b5563',
                margin: '0 10px 10px', // Disamakan dengan file kedua
            },
            searchFilterContainer: {
                marginBottom: '20px', // Disamakan dengan file kedua
                padding: '20px', // Disamakan dengan file kedua
                background: '#fff', // Disamakan dengan file kedua
                borderRadius: '10px', // Disamakan dengan file kedua
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Disamakan dengan file kedua
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            searchInputContainer: {
                maxWidth: '1200px',
                width: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
            },
            searchInput: {
                width: '100%',
                padding: '10px', // Disamakan dengan file kedua
                borderRadius: '5px', // Disamakan dengan file kedua
                border: '1px solid #ddd', // Disamakan dengan file kedua
                fontSize: '16px', // Disamakan dengan file kedua
                background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            },
            searchIcon: {
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '16px',
            },
            categoryContainer: {
                marginBottom: '32px',
                padding: '0 0 12px 0',
                background: 'transparent',
                display: 'flex',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                gap: '12px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                justifyContent: categoryList.length <= 5 ? 'center' : 'flex-start',
            },
            categoryContainerExtra: {
                '&::-webkit-scrollbar': { display: 'none' },
            },
            categoryButton: {
                padding: '8px 16px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                color: '#1e40af',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.3s ease, transform 0.2s ease',
                minWidth: '80px',
                textAlign: 'center',
            },
            categoryButtonActive: {
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                color: '#fff',
            },
            categoryButtonHover: {
                background: 'linear-gradient(135deg, #bfdbfe, #93c5fd)',
                transform: 'scale(1.05)',
            },
            pagination: {
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px', // Disamakan dengan file kedua
                marginBottom: '20px', // Disamakan dengan file kedua
                gap: '10px', // Disamakan dengan file kedua
            },
            pageButton: {
                padding: '10px 15px', // Disamakan dengan file kedua
                borderRadius: '5px', // Disamakan dengan file kedua
                border: '1px solid #ddd', // Disamakan dengan file kedua
                background: 'linear-gradient(135deg, #ffffff, #f9fafb)', // Disamakan dengan file kedua
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background 0.2s ease, transform 0.2s ease',
            },
            pageButtonActive: {
                background: 'linear-gradient(135deg, #2563eb, #1e40af)', // Disamakan dengan file kedua
                color: '#fff',
                border: '1px solid #2563eb', // Disamakan dengan file kedua
                transform: 'scale(1.05)',
            },
            pageButtonDisabled: {
                background: '#f3f4f6', // Disamakan dengan file kedua
                cursor: 'not-allowed',
                opacity: '0.6',
            },
            loadMoreButton: {
                display: filteredNews.length > 8 ? 'flex' : 'none',
                justifyContent: 'center',
                marginTop: '20px', // Disamakan dengan file kedua
                marginBottom: '20px', // Disamakan dengan file kedua
            },
            loadMoreButtonInner: {
                padding: '12px 24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.3s ease, transform 0.2s ease',
            },
            loadMoreButtonHover: {
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                transform: 'scale(1.05)',
            },
            errorMessage: {
                textAlign: 'center',
                color: '#dc2626',
                padding: '24px',
                fontSize: '16px',
            },
            loadingState: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
            },
        };

        return (
            <GuestLayout>
                <Head title="Berita">
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                    <style>{`
                        .categoryContainer::-webkit-scrollbar {
                            display: none;
                        }
                        @keyframes slideUp {
                            from { transform: translateY(50px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                        .initial-slide-up {
                            animation: slideUp 0.7s ease-out forwards;
                        }
                    `}</style>
                </Head>
                <Navbar />

                <div style={styles.body}>
                    <div style={styles.container}>
                        {/* Error message */}
                        {error && (
                            <div style={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        {/* Loading state */}
                        {isLoading ? (
                            <div style={styles.loadingState}>
                                <svg
                                    className="animate-spin h-12 w-12 text-blue-600"
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
                                {/* Search Section */}
                                <div style={styles.searchFilterContainer}>
                                    <div style={styles.searchInputContainer}>
                                        <span style={styles.searchIcon}>
                                            <i className="fas fa-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            style={styles.searchInput}
                                            placeholder="Cari berita..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            aria-label="Cari berita berdasarkan judul atau konten"
                                        />
                                    </div>
                                </div>

                                {/* Category Section */}
                                <div style={styles.categoryContainer} className="categoryContainer">
                                    {categoryList.map((category) => (
                                        <button
                                            key={category}
                                            style={{
                                                ...styles.categoryButton,
                                                ...(selectedCategory === category ? styles.categoryButtonActive : {}),
                                            }}
                                            onMouseOver={(e) => {
                                                if (selectedCategory !== category) {
                                                    Object.assign(e.currentTarget.style, styles.categoryButtonHover);
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (selectedCategory !== category) {
                                                    Object.assign(e.currentTarget.style, styles.categoryButton);
                                                }
                                            }}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setCurrentPage(1);
                                            }}
                                            aria-pressed={selectedCategory === category}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                {/* Hero Section */}
                                {featuredNews ? (
                                    <div style={styles.heroSection}>
                                        <Link
                                            href={route('news.show', featuredNews.news_id)}
                                            style={{ textDecoration: 'none' }}
                                            onMouseOver={(e) => {
                                                const card = e.currentTarget.querySelector('div');
                                                const title = card.querySelector('div > div > div:last-child');
                                                Object.assign(card.style, styles.heroMain, { transform: 'scale(1.02)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' });
                                                Object.assign(title.style, styles.heroMainTitle, { transform: 'scale(1.03)' });
                                            }}
                                            onMouseOut={(e) => {
                                                const card = e.currentTarget.querySelector('div');
                                                const title = card.querySelector('div > div > div:last-child');
                                                Object.assign(card.style, styles.heroMain, { transform: 'scale(1)' });
                                                Object.assign(title.style, styles.heroMainTitle, { transform: 'scale(1)' });
                                            }}
                                            aria-label={`Baca berita: ${featuredNews.title || 'Berita Utama'}`}
                                        >
                                            <div style={styles.heroMain} className={isLoaded ? 'initial-slide-up' : ''}>
                                                <div style={{ position: 'relative' }}>
                                                    <img
                                                        style={styles.heroMainImg}
                                                        src={featuredNews.image ? `/storage/${featuredNews.image}` : 'https://via.placeholder.com/800x480'}
                                                        alt={featuredNews.title || 'Berita Utama'}
                                                    />
                                                    <div style={styles.heroMainCategory}>
                                                        {categories.find(cat => cat.category_id === featuredNews.category_id)?.category_name || 'Uncategorized'}
                                                    </div>
                                                    <div style={styles.heroMainTitle}>{featuredNews.title || 'Judul Tidak Tersedia'}</div>
                                                </div>
                                            </div>
                                        </Link>
                                        <div style={styles.heroSidebar}>
                                            {sidebarNews.length > 0 ? sidebarNews.map((news, index) => (
                                                <Link
                                                    key={news.news_id}
                                                    href={route('news.show', news.news_id)}
                                                    style={{ textDecoration: 'none' }}
                                                    onMouseOver={(e) => Object.assign(e.currentTarget.querySelector('div').style, styles.heroSidebarNewsCard, { transform: 'scale(1.02)' })}
                                                    onMouseOut={(e) => Object.assign(e.currentTarget.querySelector('div').style, styles.heroSidebarNewsCard, { transform: 'scale(1)' })}
                                                    aria-label={`Baca berita: ${news.title || 'Berita Sidebar'}`}
                                                >
                                                    <div style={{ ...styles.heroSidebarNewsCard, animation: isLoading ? 'none' : `slideUp 0.6s ease-out ${index * 0.1}s forwards` }}>
                                                        <img
                                                            style={styles.heroSidebarNewsCardImg}
                                                            src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/300x100'}
                                                            alt={news.title || 'Berita Sidebar'}
                                                        />
                                                        <div style={styles.heroSidebarNewsCardCategory}>
                                                            {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                                        </div>
                                                        <div style={styles.heroSidebarNewsCardTitle} aria-multiline="true">
                                                            {news.title || 'Judul Tidak Tersedia'}
                                                        </div>
                                                        <div style={styles.heroSidebarNewsCardMeta}>
                                                            ({formatRole(news.creator?.role)}), {formatDate(news.created_at)}
                                                        </div>
                                                        <div style={styles.newsCardDescription}>
                                                            {(news.content?.replace(/<[^>]+>/g, '')?.substring(0, 100) || 'Deskripsi tidak tersedia') + '...'}
                                                        </div>
                                                    </div>
                                                </Link>
                                            )) : (
                                                <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', flex: 1 }}>
                                                    Tidak ada berita sidebar tersedia.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                                        Tidak ada berita utama tersedia.
                                    </div>
                                )}

                                {/* Divider */}
                                <div style={styles.sectionDivider}>
                                    <div style={styles.sectionDividerLine}></div>
                                </div>

                                {/* News Grid */}
                                <div style={styles.newsGrid}>
                                    {paginatedNews.length > 0 ? (
                                        paginatedNews.map((news, index) => (
                                            <div key={news.news_id}>
                                                <Link
                                                    href={route('news.show', news.news_id)}
                                                    style={{ textDecoration: 'none' }}
                                                    onMouseOver={(e) => Object.assign(e.currentTarget.querySelector('div').style, styles.newsCardHover)}
                                                    onMouseOut={(e) => Object.assign(e.currentTarget.querySelector('div').style, { transform: 'none', boxShadow: styles.newsCard.boxShadow })}
                                                    aria-label={`Baca berita: ${news.title || 'Berita'}`}
                                                >
                                                    <div style={{ ...styles.newsCard, animation: isLoading ? 'none' : `slideUp 0.6s ease-out ${index * 0.2}s forwards` }}>
                                                        <img
                                                            style={styles.newsCardImg}
                                                            src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/300x200'}
                                                            alt={news.title || 'Berita'}
                                                        />
                                                        <div style={styles.newsCardCategory}>
                                                            {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                                        </div>
                                                        <div style={styles.newsCardTitle}>{news.title || 'Judul Tidak Tersedia'}</div>
                                                        <div style={styles.newsCardMeta}>
                                                            ({formatRole(news.creator?.role)}), {formatDate(news.created_at)}
                                                        </div>
                                                        <div style={styles.newsCardDescription}>
                                                            {(news.content?.replace(/<[^>]+>/g, '')?.substring(0, 100) || 'Deskripsi tidak tersedia') + '...'}
                                                        </div>
                                                    </div>
                                                </Link>
                                                {index < paginatedNews.length - 1 && <hr style={styles.newsCardDivider} />}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                                            Tidak ada berita yang ditemukan.
                                        </div>
                                    )}
                                </div>

                                {/* Load More Button */}
                                <div style={styles.loadMoreButton}>
                                    <button
                                        style={styles.loadMoreButtonInner}
                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.loadMoreButtonHover)}
                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.loadMoreButtonInner)}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        aria-label="Lihat lebih banyak berita"
                                    >
                                        Lihat Lebih Banyak
                                    </button>
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
                                            aria-label="Halaman sebelumnya"
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
                                                aria-current={currentPage === index + 1 ? 'page' : undefined}
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
                                            aria-label="Halaman berikutnya"
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