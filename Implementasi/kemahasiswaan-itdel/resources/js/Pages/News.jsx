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
            <div className="news-page py-5">
                <div className="container">
                    {/* Header Section */}
                    <div className="text-center mb-5 wow fadeIn" data-wow-delay="0.2s">
                        <h1 className="news-heading display-4 fw-bold text-white mb-3">Berita Terbaru</h1>
                        <p className="lead text-gray-300 mx-auto" style={{ maxWidth: '700px' }}>
                            Ikuti informasi terbaru seputar kegiatan, prestasi, dan pengumuman dari IT Del Kemahasiswaan.
                        </p>
                    </div>

                    {/* Featured News Section */}
                    {featuredNews && (
                        <div className="featured-news mb-5 wow fadeIn" data-wow-delay="0.4s">
                            <div className="featured-card position-relative overflow-hidden rounded-lg">
                                <div className="featured-image-container">
                                    <img
                                        src={featuredNews.image ? `/storage/${featuredNews.image}` : 'https://via.placeholder.com/1200x600'}
                                        alt={featuredNews.title}
                                        className="featured-image"
                                    />
                                    <div className="featured-overlay"></div>
                                </div>
                                <div className="featured-content p-4 p-md-5">
                                    <div className="featured-badge mb-2">
                                        <span className="badge bg-primary px-3 py-2 rounded-pill fs-6">
                                            {categories.find(cat => cat.category_id === featuredNews.category_id)?.category_name || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <h2 className="featured-title text-white fw-bold mb-3">{featuredNews.title}</h2>
                                    <p className="featured-excerpt text-gray-200 mb-4" dangerouslySetInnerHTML={{ __html: featuredNews.content.substring(0, 200) + '...' }} />
                                    <div className="d-flex align-items-center text-gray-300 mb-4">
                                        <i className="far fa-calendar-alt me-2"></i>
                                        <span>{formatDate(featuredNews.created_at)}</span>
                                    </div>
                                    <Link
                                        href={route('news.show', featuredNews.news_id)}
                                        className="btn btn-primary btn-lg px-4 py-2 featured-btn"
                                    >
                                        Baca Selengkapnya <i className="fas fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Latest News Highlight Section */}
                    <div className="latest-news-section mb-5">
                        <div className="section-header d-flex justify-content-between align-items-center mb-4">
                            <h3 className="text-white fw-bold position-relative highlight-heading">
                                Berita Terbaru
                                <span className="highlight-line"></span>
                            </h3>
                            <Link href="#" className="text-primary text-decoration-none">
                                Lihat Semua <i className="fas fa-arrow-right ms-1"></i>
                            </Link>
                        </div>
                        
                        <div className="row">
                            {latestNews.map((news, index) => (
                                <div 
                                    key={news.news_id} 
                                    className="col-md-4 mb-4 wow fadeIn" 
                                    data-wow-delay={`${0.2 + (index * 0.1)}s`}
                                >
                                    <div className="latest-news-card h-100">
                                        <div className="latest-news-image-wrapper position-relative">
                                            <img
                                                src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/600x400'}
                                                alt={news.title}
                                                className="img-fluid rounded-top latest-news-image"
                                            />
                                            <div className="latest-news-date">
                                                <span className="day">{new Date(news.created_at).getDate()}</span>
                                                <span className="month">{new Date(news.created_at).toLocaleString('id-ID', { month: 'short' })}</span>
                                            </div>
                                            <span className="badge bg-primary latest-news-category">
                                                {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                            </span>
                                        </div>
                                        <div className="latest-news-content p-4">
                                            <h5 className="text-white mb-3">{news.title}</h5>
                                            <p className="text-gray-300 mb-3" dangerouslySetInnerHTML={{ __html: news.content.substring(0, 100) + '...' }} />
                                            <Link
                                                href={route('news.show', news.news_id)}
                                                className="latest-read-more"
                                            >
                                                Baca Selengkapnya <i className="fas fa-long-arrow-alt-right ms-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="search-filter-container mb-5 p-4 rounded-lg wow fadeIn" data-wow-delay="0.2s">
                        <div className="row">
                            <div className="col-md-8 mb-3 mb-md-0">
                                <div className="search-input-wrapper">
                                    <i className="fas fa-search search-icon"></i>
                                    <input
                                        type="text"
                                        className="form-control news-search"
                                        placeholder="Cari berita..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="filter-select-wrapper">
                                    <select
                                        className="form-select news-filter"
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
                                <h3 className="text-white fw-bold position-relative highlight-heading">
                                    Semua Berita
                                    <span className="highlight-line"></span>
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
                                            <div className="news-card h-100">
                                                <div className="news-image-wrapper position-relative">
                                                    <img
                                                        src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/600x400'}
                                                        alt={news.title}
                                                        className="img-fluid rounded-top news-image"
                                                    />
                                                    <div className="news-overlay"></div>
                                                    <span className="badge bg-primary news-category">
                                                        {categories.find(cat => cat.category_id === news.category_id)?.category_name || 'Uncategorized'}
                                                    </span>
                                                </div>
                                                <div className="news-content p-4">
                                                    <h5 className="text-white mb-2">{news.title}</h5>
                                                    <p className="text-gray-300 mb-3" dangerouslySetInnerHTML={{ __html: news.content.substring(0, 100) + '...' }} />
                                                    <div className="d-flex align-items-center text-gray-400 mb-3">
                                                        <i className="far fa-calendar-alt me-2"></i>
                                                        <span>{formatDate(news.created_at)}</span>
                                                    </div>
                                                    <Link
                                                        href={route('news.show', news.news_id)}
                                                        className="btn btn-primary read-more-btn"
                                                    >
                                                        Baca Selengkapnya <i className="fas fa-arrow-right ms-1"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 p-5 text-center text-gray-300 no-results">
                                        <i className="fas fa-search fa-3x mb-3"></i>
                                        <h4>Tidak ada berita yang ditemukan.</h4>
                                        <p>Coba gunakan kata kunci atau kategori yang berbeda.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="mt-5 wow fadeIn" data-wow-delay="0.2s">
                                    <ul className="pagination pagination-lg justify-content-center">
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
                            <div className="sidebar-popular wow fadeIn" data-wow-delay="0.4s">
                                <div className="sidebar-header">
                                    <h4 className="sidebar-heading text-white fw-bold position-relative">
                                        Berita Populer
                                        <span className="sidebar-highlight-line"></span>
                                    </h4>
                                </div>
                                
                                <div className="sidebar-content">
                                    {newsItems.slice(0, 4).map((news, index) => (
                                        <div key={news.news_id} className="sidebar-item wow fadeIn" data-wow-delay={`${0.5 + (index * 0.1)}s`}>
                                            <Link href={route('news.show', news.news_id)} className="sidebar-link">
                                                <div className="d-flex align-items-center">
                                                    <div className="sidebar-image-container">
                                                        <img
                                                            src={news.image ? `/storage/${news.image}` : 'https://via.placeholder.com/100x80'}
                                                            alt={news.title}
                                                            className="sidebar-image"
                                                        />
                                                        <div className="sidebar-image-number">{index + 1}</div>
                                                    </div>
                                                    <div className="sidebar-text">
                                                        <h6 className="sidebar-title text-white mb-1">{news.title}</h6>
                                                        <div className="d-flex align-items-center sidebar-date">
                                                            <i className="far fa-calendar-alt me-2"></i>
                                                            <span>{formatDate(news.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Categories Sidebar */}
                            <div className="sidebar-categories mt-5 wow fadeIn" data-wow-delay="0.6s">
                                <div className="sidebar-header">
                                    <h4 className="sidebar-heading text-white fw-bold position-relative">
                                        Kategori Berita
                                        <span className="sidebar-highlight-line"></span>
                                    </h4>
                                </div>
                                
                                <div className="categories-list">
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
                            
                            {/* Subscribe Card */}
                            <div className="subscribe-card mt-5 p-4 rounded-lg text-center wow fadeIn" data-wow-delay="0.8s">
                                <i className="fas fa-envelope-open-text subscribe-icon mb-3"></i>
                                <h5 className="text-white mb-3">Dapatkan Berita Terbaru</h5>
                                <p className="text-gray-300 mb-3">Daftarkan email Anda untuk mendapatkan berita dan informasi terbaru</p>
                                <div className="subscribe-form">
                                    <input type="email" className="form-control mb-2" placeholder="Email Anda" />
                                    <button className="btn btn-primary w-100">Berlangganan</button>
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