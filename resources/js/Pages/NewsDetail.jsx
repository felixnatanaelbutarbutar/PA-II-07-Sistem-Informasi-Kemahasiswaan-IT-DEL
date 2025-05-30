import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import 'react-quill/dist/quill.snow.css'; // Impor CSS Quill

export default function NewsDetail() {
    const { news, news_id, newsItems, categories } = usePage().props;

    // State for current URL and search query
    const [currentUrl, setCurrentUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Set current URL on mount
    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    // Debounced search handler
    const handleSearch = debounce((value) => {
        setSearchQuery(value);
    }, 300);

    // Function to share to social media
    const shareToSocial = (platform) => {
        const title = news.title;
        const url = currentUrl;

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
            default:
                return;
        }
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    // Format role to user-friendly text
    const formatRole = (role) => {
        const roleMap = {
            superadmin: 'Super Admin',
            kemahasiswaan: 'Staf Kemahasiswaan',
            adminbem: 'Admin BEM',
            adminmpm: 'Admin MPM',
            mahasiswa: 'Mahasiswa',
        };
        return roleMap[role?.toLowerCase()] || role || 'Penulis';
    };

    // Filter other news with memoization
    const otherNews = useMemo(() => {
        return newsItems
            .filter(item => item.news_id !== news_id &&
                (!searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
    }, [newsItems, news_id, searchQuery]);

    // Handle missing news
    if (!news) {
        return (
            <GuestLayout>
                <Navbar showBreadcrumbAndHeader={false} />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-xl">
                        <svg
                            className="w-16 h-16 mx-auto text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h3 className="mt-4 text-xl font-bold text-gray-800">Berita tidak ditemukan.</h3>
                        <Link
                            href="/newsguest"
                            className="inline-block px-6 py-3 mt-6 text-sm font-medium text-white transition-colors duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Kembali ke Halaman Berita
                        </Link>
                    </div>
                </div>
                <FooterLayout />
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head>
                <title>{news.title}</title>
                <meta name="description" content={news.content?.substring(0, 160) || 'Berita dari Institut Teknologi Del'} />
                <meta property="og:title" content={news.title} />
                <meta property="og:description" content={news.content?.substring(0, 160) || 'Berita dari Institut Teknologi Del'} />
                <meta property="og:image" content={news.image ? `/storage/${news.image}` : 'https://kemahasiswaanitdel.site/assets/images/slide2.png'} />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <Navbar showBreadcrumbAndHeader={false} />

            <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
                {/* Hero Section */}
                {news.image && (
                    <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
                        <div className="absolute inset-0 bg-black/30 z-10"></div>
                        <img
                            src={`/storage/${news.image}`}
                            alt={news.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.src = 'https://kemahasiswaanitdel.site/assets/images/slide2.png')}
                        />
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="max-w-7xl mx-auto">
                                <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-medium text-white bg-blue-600 rounded-full">
                                    {news.category ? news.category.category_name : 'Uncategorized'}
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 max-w-4xl">
                                    {news.title}
                                </h1>
                                <div className="flex items-center text-sm text-gray-200">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {new Date(news.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        href="/newsguest"
                        className="inline-flex items-center px-5 py-4 rounded-full bg-white shadow-md text-blue-600 hover:text-blue-700 hover:shadow-lg transition-all duration-300 mb-2 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <svg
                            className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Halaman Berita
                    </Link>

                    <div className="lg:flex lg:gap-10">
                        {/* Article Content */}
                        <div className="lg:w-2/3">
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
                                {!news.image && (
                                    <div className="mb-8">
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                            {news.title}
                                        </h1>
                                        <div className="flex items-center text-sm text-gray-500 mb-6">
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {new Date(news.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <span className="mx-2">•</span>
                                            <span className="text-blue-600 font-medium">
                                                {news.category ? news.category.category_name : 'Uncategorized'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Article content */}
                                <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                    <div className="ql-editor" dangerouslySetInnerHTML={{ __html: news.content }} />
                                </article>

                                {/* Author Info */}
                                <div className="flex justify-end mt-6 mb-6">
                                    <p className="text-sm font-medium text-gray-900">
                                        Dibuat oleh: {formatRole(news.creator?.role) || 'Penulis'}
                                    </p>
                                </div>

                                {/* Share Buttons */}
                                <div className="mt-10 pt-6 border-t border-gray-200">
                                    <h4 className="text-lg font-medium text-gray-700 mb-4">Bagikan artikel ini</h4>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => shareToSocial('facebook')}
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            aria-label="Bagikan ke Facebook"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => shareToSocial('twitter')}
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                            aria-label="Bagikan ke Twitter"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => shareToSocial('linkedin')}
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                            aria-label="Bagikan ke LinkedIn"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => shareToSocial('whatsapp')}
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                            aria-label="Bagikan ke WhatsApp"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 11.7c0 6.45-5.27 11.68-11.78 11.68-2.07 0-4-.53-5.7-1.45L0 24l2.13-6.27a11.57 11.57 0 01-1.7-6.04C.44 5.23 5.72 0 12.23 0 18.72 0 24 5.23 24 11.7M12.22 1.85c-5.46 0-9.9 4.41-9.9 9.83 0 2.15.7 4.14 1.88 5.76L2.96 21.1l3.8-1.2a9.9 9.9 0 005.46 1.62c5.46 0 9.9-4.4 9.9-9.83a9.88 9.88 0 00-9.9-9.83m5.95 12.52c-.08-.12-.27-.19-.56-.33-.28-.14-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.14-.2.29-.75.93-.91 1.12-.17.2-.34.22-.63.08-.29-.15-1.22-.45-2.32-1.43a8.64 8.64 0 01-1.6-1.98c-.18-.29-.03-.44.12-.58.13-.13.29-.34.43-.5.15-.17.2-.3.29-.48.1-.2.05-.36-.02-.5-.08-.15-.65-1.56-.9-2.13-.24-.58-.48-.48-.65-.48-.17 0-.37-.03-.56-.03-.2 0-.5.08-.77.36-.26.29-1 .98-1 2.4 0 1.4 1.03 2.76 1.17 2.96.14.19 2 3.17 4.93 4.32 2.94 1.15 2.94.77 3.47.72.53-.05 1.7-.7 1.95-1.36.24-.67.24-1.25.17-1.37" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3 mt-6 lg:mt-0">
                            <div>
                                {/* Other News */}
                                <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
                                    {/* Search Bar */}
                                    <div className="mb-6">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Cari berita..."
                                                className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-sm"
                                                onChange={(e) => handleSearch(e.target.value)}
                                                aria-label="Cari berita berdasarkan judul"
                                            />
                                            <svg
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 relative pb-3 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-16 before:h-1 before:bg-blue-600 before:rounded-full">
                                        Berita Lainnya
                                    </h2>
                                    {otherNews.length > 0 ? (
                                        <div className="space-y-6">
                                            {otherNews.map((item) => (
                                                <Link
                                                    key={item.news_id}
                                                    href={route('news.show', item.news_id)}
                                                    className="flex group rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                                >
                                                    {item.image && (
                                                        <div className="w-28 h-28 flex-shrink-0 overflow-hidden">
                                                            <img
                                                                src={`/storage/${item.image}`}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                onError={(e) => (e.target.src = 'https://kemahasiswaanitdel.site/assets/images/slide2.png')}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 p-4 bg-gray-50">
                                                        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center text-xs text-gray-500 mt-2">
                                                            <svg
                                                                className="w-3 h-3 mr-1"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link
                                                href="/newsguest"
                                                className="block w-full py-3 text-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 rounded-lg mt-8"
                                            >
                                                Lihat Semua Berita
                                            </Link>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 py-4">Tidak ada berita lainnya.</p>
                                    )}
                                </div>

                                {/* Featured Categories */}
                                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Kategori Populer</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <span
                                                key={category.category_id}
                                                className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full"
                                            >
                                                {category.category_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <FooterLayout />
                </div>
            </div>

            <style jsx>{`
                .prose img {
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    margin: 2rem 0;
                    max-width: 100%;
                    height: auto;
                }
                .prose h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    color: #1e40af;
                }
                .prose h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: #1e3a8a;
                }
                .prose p {
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                }
                .prose ul,
                .prose ol {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                }
                .prose li {
                    margin-bottom: 0.5rem;
                }
                .prose blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1rem;
                    font-style: italic;
                    color: #4b5563;
                    margin: 1.5rem 0;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .ql-editor {
                    padding: 0; /* Pastikan tidak ada padding berlebih */
                }
            `}</style>
        </GuestLayout>
    );
}