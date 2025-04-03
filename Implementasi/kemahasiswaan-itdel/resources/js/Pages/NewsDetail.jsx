import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';

export default function NewsDetail() {
    const { news_id } = usePage().props; // Ambil news_id dari rute Inertia.js
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ambil data berita dari API
    useEffect(() => {
        if (!news_id) {
            setError('ID berita tidak ditemukan.');
            setLoading(false);
            return;
        }

        fetch(`http://localhost:8000/api/news/${news_id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal mengambil data berita');
                }
                return response.json();
            })
            .then(data => {
                console.log('Data berita dari API:', data);
                setNews(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching news detail:', error);
                setError('Gagal memuat detail berita. Silakan coba lagi nanti.');
                setLoading(false);
            });
    }, [news_id]);

    if (loading) {
        return (
            <GuestLayout>
                <NavbarGuestLayout />
                <div className="news-detail py-12 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-gray-500">Memuat...</p>
                    </div>
                </div>
                <FooterLayout />
            </GuestLayout>
        );
    }

    if (error) {
        return (
            <GuestLayout>
                <NavbarGuestLayout />
                <div className="news-detail py-12 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-red-500">{error}</p>
                    </div>
                </div>
                <FooterLayout />
            </GuestLayout>
        );
    }

    if (!news) {
        return (
            <GuestLayout>
                <NavbarGuestLayout />
                <div className="news-detail py-12 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-gray-500">Berita tidak ditemukan.</p>
                    </div>
                </div>
                <FooterLayout />
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <NavbarGuestLayout />
            <div className="news-detail py-12 bg-gray-50">
                <Head title={news.title} />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/newsguest"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Kembali ke Halaman Berita
                    </Link>

                    {/* News Content */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            {news.title}
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 mb-6">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
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
                            <span className="mx-2">•</span>
                            <span className="text-blue-600">
                                {news.category ? news.category.category_name : "Uncategorized"}
                            </span>
                        </div>

                        {news.image && (
                            <div className="mb-6">
                                <img
                                    src={`/storage/${news.image}`}
                                    alt={news.title}
                                    className="w-full h-96 object-cover rounded-lg"
                                    onError={(e) => (e.target.src = "/assets/images/slide2.png")}
                                />
                            </div>
                        )}

                        {/* Render HTML content */}
                        <div className="prose prose-lg text-gray-700" dangerouslySetInnerHTML={{ __html: news.content }}></div>
                    </div>
                </div>

                <style>
                    {`
                    .news-detail {
                        background: #f8fafc;
                    }
                    .prose {
                        max-width: none;
                    }
                    .prose p {
                        margin-bottom: 1rem;
                    }
                `}
                </style>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}