// File: resources/js/Pages/News.jsx
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/news.css';

export default function News({ newsItems, categories }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [featuredNews, setFeaturedNews] = useState(null);
    const [latestNews, setLatestNews] = useState([]);

    // Categories for filtering (including "Semua" as the default)
    const categoryList = ['Semua', ...categories.map(cat => cat.category_name)];

    const itemsPerPage = 6;

    useEffect(() => {
        // Set featured news (either marked as featured or the most recent one)
        const featured = newsItems.find(news => news.isFeatured) || 
                         (newsItems.length > 0 ? {...newsItems[0], isFeatured: true} : null);
        setFeaturedNews(featured);

        // Get 3 latest news items excluding the featured one
        const latestItems = [...newsItems]
            .filter(news => news.news_id !== (featured?.news_id || 0))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
        setLatestNews(latestItems);
    }, [newsItems]);

    // Filter news based on search and category
    const filteredNews = newsItems.filter((news) => {
        const matchesSearch =
            news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            news.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === 'Semua' ||
            categories.find(cat => cat.category_id === news.category_id)?.category_name === selectedCategory;
        return matchesSearch && matchesCategory && news.news_id !== (featuredNews?.news_id || 0);
    });

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

    return (
        <GuestLayout>
            <NavbarGuestLayout />
            <div className="news-page">
                <div className="container">
                    {/* Header Section */}
                    <div className="news-header text-center mb-5 wow fadeIn" data-wow-delay="0.2s">
                        <h1 className="news-heading display-4 fw-bold text-white mb-3">Berita Terbaru</h1>
                        <p className="news-subtitle text-gray-300 mx-auto">
                            Ikuti informasi terbaru seputar kegiatan, prestasi, dan pengumuman dari IT Del Kemahasiswaan.
                        </p>
                    </div>

                    {/* Featured News Section */}
                    {featuredNews && (
                        <div className="featured-news-section mb-5 wow fadeIn" data-wow-delay="0.4s">
                            <div className="featured-card">
                                <div className="featured-img-container">
                                    <img
                                        src={featuredNews.image ? `/storage/${featuredNews.image}` : 'https://via.placeholder.com/1200x600'}
                                        alt={featuredNews.title}
                                        className="featured-img"
                                    />
                                    <div className="featured-overlay"></div>
                                </div>
                                <div className="featured-content">
                                    <div className="featured-category">
                                        <span className="category-badge">
                                            {categories.find(cat => cat.category_id === featuredNews.category_id)?.category_name || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <h2 className="featured-title">{featuredNews.title}</h2>
                                    <p className="featured-excerpt" dangerouslySetInnerHTML={{ __html: featuredNews.content.substring(0, 200) + '...' }} />
                                    <div className="featured-meta">
                                        <i className="far fa-calendar-alt"></i>
                                        <span>{formatDate(featuredNews.created_at)}</span>
                                    </div>
                                    <Link
                                        href={route('news.show', featuredNews.news_id)}
                                        className="featured-btn"
                                    >
                                        Baca Selengkapnya <i className="fas fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Latest News Section */}
                    <div className="latest-news-section mb-5">
                        <div className="section-header">
                            <h3 className="section-title">
                                Berita Terbaru
                                <span className="section-line"></span>
                            </h3>
                            <Link href="#" className="view-all">
                                Lihat Semua <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                        
                        <div className="row">
                            {latestNews.map((news, index) => (
                                <div 
                                    key={news.news_id} 
                                    className="col-md-4 mb-4 wow fadeIn" 
                                    data-wow-delay={`${0.2 + (index * 0.1)}s`}
                                >
                                    <div className="latest-news-card">
                                        <div className="card-img-wrapper">
                                            <img
                                                src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/600x400'}
                                                alt={news.title}
                                                className="card-img"
                                            />
                                            <div className="card-date">
                                                <span className="date-day">{new Date(news.created_at).getDate()}</span>
                                                <span className="date-month">{new Date(news.created_at).toLocaleString('id-ID', { month: 'short' })}</span>
                                            </div>
                                            <span className="card-category">
                                                {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                            </span>
                                        </div>
                                        <div className="card-content">
                                            <h5 className="card-title">{news.title}</h5>
                                            <p className="card-text" dangerouslySetInnerHTML={{ __html: news.content.substring(0, 100) + '...' }} />
                                            <Link
                                                href={route('news.show', news.news_id)}
                                                className="read-more-link"
                                            >
                                                Baca Selengkapnya <i className="fas fa-long-arrow-alt-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="search-filter-section mb-5 wow fadeIn" data-wow-delay="0.2s">
                        <div className="row">
                            <div className="col-md-8 mb-3 mb-md-0">
                                <div className="search-wrapper">
                                    <i className="fas fa-search search-icon"></i>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Cari berita..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="filter-wrapper">
                                    <select
                                        className="filter-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categoryList.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    <i className="fas fa-filter filter-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content and Sidebar */}
                    <div className="row">
                        {/* News Grid */}
                        <div className="col-lg-8">
                            <div className="section-header mb-4">
                                <h3 className="section-title">
                                    Semua Berita
                                    <span className="section-line"></span>
                                </h3>
                            </div>
                            
                            <div className="row">
                                {paginatedNews.length > 0 ? (
                                    paginatedNews.map((news, index) => (
                                        <div
                                            key={news.news_id}
                                            className="col-md-6 mb-4 wow fadeIn"
                                            data-wow-delay={`${0.2 + (index * 0.1)}s`}
                                        >
                                            <div className="news-card">
                                                <div className="card-img-wrapper">
                                                    <img
                                                        src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/600x400'}
                                                        alt={news.title}
                                                        className="card-img"
                                                    />
                                                    <div className="img-overlay"></div>
                                                    <span className="card-category">
                                                        {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                                    </span>
                                                </div>
                                                <div className="card-content">
                                                    <h5 className="card-title">{news.title}</h5>
                                                    <p className="card-text" dangerouslySetInnerHTML={{ __html: news.content.substring(0, 100) + '...' }} />
                                                    <div className="card-meta">
                                                        <i className="far fa-calendar-alt"></i>
                                                        <span>{formatDate(news.created_at)}</span>
                                                    </div>
                                                    <Link
                                                        href={route('news.show', news.news_id)}
                                                        className="card-btn"
                                                    >
                                                        Baca Selengkapnya <i className="fas fa-arrow-right"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">
                                        <i className="fas fa-search no-results-icon"></i>
                                        <h4>Tidak ada berita yang ditemukan.</h4>
                                        <p>Coba gunakan kata kunci atau kategori yang berbeda.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="pagination-wrapper wow fadeIn" data-wow-delay="0.2s">
                                    <ul className="pagination">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <li
                                                key={index}
                                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            {/* Popular News Sidebar */}
                            <div className="sidebar-widget popular-news wow fadeIn" data-wow-delay="0.4s">
                                <div className="widget-header">
                                    <h4 className="widget-title">
                                        Berita Populer
                                        <span className="widget-line"></span>
                                    </h4>
                                </div>
                                
                                <div className="widget-content">
                                    {newsItems.slice(0, 4).map((news, index) => (
                                        <div key={news.news_id} className="popular-item wow fadeIn" data-wow-delay={`${0.5 + (index * 0.1)}s`}>
                                            <Link href={route('news.show', news.news_id)} className="popular-link">
                                                <div className="popular-img-container">
                                                    <img
                                                        src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/100x80'}
                                                        alt={news.title}
                                                        className="popular-img"
                                                    />
                                                    <div className="popular-number">{index + 1}</div>
                                                </div>
                                                <div className="popular-text">
                                                    <h6 className="popular-title">{news.title}</h6>
                                                    <div className="popular-date">
                                                        <i className="far fa-calendar-alt"></i>
                                                        <span>{formatDate(news.created_at)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Categories Sidebar */}
                            <div className="sidebar-widget categories-widget mt-4 wow fadeIn" data-wow-delay="0.6s">
                                <div className="widget-header">
                                    <h4 className="widget-title">
                                        Kategori Berita
                                        <span className="widget-line"></span>
                                    </h4>
                                </div>
                                
                                <div className="widget-content">
                                    {categories.map((category, index) => (
                                        <div key={category.category_id} className="category-item wow fadeIn" data-wow-delay={`${0.7 + (index * 0.1)}s`}>
                                            <button 
                                                className={`category-btn ${selectedCategory === category.category_name ? 'active' : ''}`}
                                                onClick={() => setSelectedCategory(category.category_name)}
                                            >
                                                <span className="category-name">{category.category_name}</span>
                                                <span className="category-count">
                                                    {newsItems.filter(news => news.category_id === category.category_id).length}
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Subscribe Widget */}
                            <div className="sidebar-widget subscribe-widget mt-4 wow fadeIn" data-wow-delay="0.8s">
                                <div className="subscribe-content">
                                    <i className="fas fa-envelope-open-text subscribe-icon"></i>
                                    <h5 className="subscribe-title">Dapatkan Berita Terbaru</h5>
                                    <p className="subscribe-text">Daftarkan email Anda untuk mendapatkan berita dan informasi terbaru</p>
                                    <div className="subscribe-form">
                                        <input type="email" className="form-control subscribe-input" placeholder="Email Anda" />
                                        <button className="btn subscribe-btn">Berlangganan</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}