import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';

export default function Home() {
    const swiperElRef = useRef(null);
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [achievements, setAchievements] = useState({
        International: { 'Gold': 0, 'Silver': 0, 'Bronze': 0 },
        National: { 'Gold': 0, 'Silver': 0, 'Bronze': 0 },
        Regional: { 'Gold': 0, 'Silver': 0, 'Bronze': 0 },
    });
    const [carousels, setCarousels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [carouselLoading, setCarouselLoading] = useState(true);
    const [carouselError, setCarouselError] = useState(null);

    // Ambil data dari API saat komponen dimuat
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch News
                const newsResponse = await fetch('http://localhost:8000/api/news?per_page=4');
                if (!newsResponse.ok) throw new Error('Gagal mengambil data berita');
                const newsData = await newsResponse.json();
                setNews(newsData.data || []);

                // Fetch Categories
                const categoriesResponse = await fetch('http://localhost:8000/api/news-categories');
                if (!categoriesResponse.ok) throw new Error('Gagal mengambil data kategori');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Fetch Announcements
                const announcementsResponse = await fetch('http://localhost:8000/api/announcements?per_page=4');
                if (!announcementsResponse.ok) throw new Error('Gagal mengambil data pengumuman');
                const announcementsData = await announcementsResponse.json();
                setAnnouncements(announcementsData.data || []);

                // Fetch Achievements
                const achievementsResponse = await fetch('http://localhost:8000/api/achievements-grouped');
                if (!achievementsResponse.ok) throw new Error('Gagal mengambil data prestasi');
                const achievementsData = await achievementsResponse.json();
                setAchievements(achievementsData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchCarousels = async () => {
            setCarouselLoading(true);
            try {
                const carouselResponse = await fetch('http://localhost:8000/api/carousel/guest');
                if (!carouselResponse.ok) throw new Error('Gagal mengambil data carousel');
                const carouselData = await carouselResponse.json();
                setCarousels(carouselData || []);
            } catch (err) {
                console.error('Error fetching carousels:', err);
                setCarouselError('Gagal memuat carousel. Silakan coba lagi nanti.');
            } finally {
                setCarouselLoading(false);
            }
        };

        fetchData();
        fetchCarousels();
    }, []);

    // Initialize Swiper
    useEffect(() => {
        const swiperStyles = document.createElement('link');
        swiperStyles.rel = 'stylesheet';
        swiperStyles.href = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css';
        document.head.appendChild(swiperStyles);

        const swiperScript = document.createElement('script');
        swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js';
        swiperScript.async = true;
        document.body.appendChild(swiperScript);

        let swiperInstance = null;

        swiperScript.onload = () => {
            if (typeof Swiper !== 'undefined' && swiperElRef.current) {
                // Hanya aktifkan loop dan navigasi jika ada lebih dari 1 slide
                const shouldLoop = carousels.length > 1;
                swiperInstance = new Swiper('.swiper-container', {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    loop: shouldLoop, // Nonaktifkan loop jika hanya 1 slide
                    speed: 1000,
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                    keyboard: { enabled: true, onlyInViewport: true },
                    autoplay: { delay: 5000, disableOnInteraction: false },
                    pagination: { 
                        el: '.swiper-pagination', 
                        clickable: true 
                    },
                    navigation: { 
                        nextEl: '.swiper-button-next', 
                        prevEl: '.swiper-button-prev',
                        disabledClass: 'swiper-button-disabled' // Pastikan kelas disabled diterapkan
                    },
                });
            }
        };

        return () => {
            if (swiperInstance) {
                swiperInstance.destroy(true, true); // Bersihkan instance Swiper
            }
            if (swiperStyles.parentNode) document.head.removeChild(swiperStyles);
            if (swiperScript.parentNode) document.body.removeChild(swiperScript);
        };
    }, [carousels]); // Tambahkan dependency carousels agar Swiper diinisialisasi ulang

    // Add scroll event listener for navbar
    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 0) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Add smooth scroll behavior
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    // Format date helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Inline styles
    const styles = {
        body: {
            fontFamily: "'Inter', sans-serif",
            margin: 0,
            padding: 0,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
        },
        latestNews: {
            padding: '48px 0',
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        },
        latestAnnouncements: {
            padding: '48px 0',
            background: 'linear-gradient(180deg, #e2e8f0 0%, #f8fafc 100%)',
        },
        achievementsSection: {
            padding: '48px 0',
            background: 'linear-gradient(180deg, #e2e8f0 0%, #f8fafc 100%)',
        },
        sectionHeader: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            marginBottom: '40px',
        },
        sectionTitle: {
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
        },
        sectionSubtitle: {
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '8px',
        },
        achievementContainer: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
        },
        achievementBox: {
            flex: '1',
            minWidth: '240px',
            background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)',
            padding: '16px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            border: '2px solid #fbbf24',
        },
        achievementTotal: {
            fontSize: '40px',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        achievementLabel: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '20px',
            textTransform: 'uppercase',
        },
        achievementDetail: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px',
            borderRadius: '8px',
        },
        achievementDetailLabel: {
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
        },
        achievementDetailValue: {
            fontSize: '14px',
            fontWeight: '600',
            background: '#fbbf24',
            color: '#1e3a8a',
            padding: '4px 8px',
            borderRadius: '6px',
            minWidth: '40px',
            textAlign: 'center',
        },
        newsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
        },
        announcementGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
        },
        newsCard: {
            background: 'rgba(255, 255, 255, 0.95)', // Perbaikan typo dari 375 menjadi 255
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            backdropFilter: 'blur(10px)',
        },
        announcementCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            backdropFilter: 'blur(10px)',
        },
        cardHover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        },
        newsCardImgContainer: {
            position: 'relative',
            height: '192px',
            overflow: 'hidden',
        },
        announcementCardImgContainer: {
            position: 'relative',
            height: '192px',
            overflow: 'hidden',
        },
        cardImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
        },
        cardImgHover: {
            transform: 'scale(1.05)',
        },
        cardIconContainer: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
        },
        cardIcon: {
            width: '48px',
            height: '48px',
            color: '#6b7280',
        },
        cardCategory: {
            position: 'absolute',
            top: '0',
            right: '0',
            background: 'linear-gradient(45deg, #007bff, #00c4ff)',
            color: '#fff',
            padding: '4px 12px',
            fontSize: '12px',
            borderBottomLeftRadius: '8px',
        },
        cardContent: {
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
        },
        cardTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        cardDescription: {
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        cardDate: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px',
        },
        cardDateIcon: {
            width: '16px',
            height: '16px',
            marginRight: '4px',
        },
        cardButton: {
            marginTop: 'auto',
            display: 'inline-block',
            background: '#2563eb',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'background 0.3s',
        },
        cardButtonHover: {
            background: '#1d4ed8',
        },
        emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
        },
        emptyStateIcon: {
            width: '64px',
            height: '64px',
            color: '#9ca3af',
            marginBottom: '16px',
        },
        emptyStateTitle: {
            fontSize: '20px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px',
        },
        emptyStateText: {
            color: '#6b7280',
        },
        viewAllButtonContainer: {
            textAlign: 'center',
            marginTop: '40px',
        },
        viewAllButton: {
            display: 'inline-block',
            background: '#e5e7eb',
            color: '#374151',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background 0.3s',
        },
        viewAllButtonHover: {
            background: '#d1d5db',
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

    // Hitung total prestasi per kategori (hanya medali Gold, Silver, Bronze)
    const getTotalAchievements = (category) => {
        return (
            achievements[category]['Gold'] +
            achievements[category]['Silver'] +
            achievements[category]['Bronze']
        );
    };

    return (
        <GuestLayout>
            <Head title="Beranda" />
            <NavbarGuestLayout />

            {/* Hero Carousel */}
            <div className="swiper-container" ref={swiperElRef}>
                <div className="swiper-wrapper">
                    {carouselLoading ? (
                        <div className="swiper-slide">
                            <div
                                className="carousel-slide flex items-center justify-center"
                                style={{
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <p className="text-white-500">Memuat carousel...</p>
                            </div>
                        </div>
                    ) : carouselError ? (
                        <div className="swiper-slide">
                            <div
                                className="carousel-slide flex items-center justify-center bg-red-100"
                                style={{
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <p className="text-red-500">{carouselError}</p>
                            </div>
                        </div>
                    ) : carousels.length === 0 ? (
                        <div className="swiper-slide">
                            <div
                                className="carousel-slide flex items-center justify-center bg-gray-100"
                                style={{
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <p className="text-gray-500">Tidak ada carousel tersedia.</p>
                            </div>
                        </div>
                    ) : (
                        carousels.map((carousel) => (
                            <div key={carousel.carousel_id} className="swiper-slide">
                                <div
                                    className="carousel-slide"
                                    style={{
                                        backgroundImage: `url(/storage/${carousel.image_path})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
                <div className="swiper-pagination"></div>
            </div>

            {/* Social Media Section */}
            <div className="relative -mt-[1px] bg-gradient-to-r from-blue-900 to-blue-700">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                        <a
                            href="https://www.instagram.com/kemahasiswaanitdel/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-3">
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">
                                @kemahasiswaanitdel
                            </span>
                        </a>

                        <a
                            href="https://wa.me/+6285142232595"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-green-500 p-3">
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">
                                Kemahasiswaan
                            </span>
                        </a>

                        <a
                            href="https://www.tiktok.com/@institut.teknologi.del"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-black p-3">
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.49v-3.88a4.85 4.85 0 01-1.2 0z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">
                                @it.del
                            </span>
                        </a>

                        <a
                            href="https://www.youtube.com/@institutteknologidel1337"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-red-600 p-3">
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">
                                Institut Teknologi Del
                            </span>
                        </a>

                        <a
                            href="mailto:kemahasiswaan@del.ac.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-blue-500 p-3">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <span className="text-base font-medium">
                                kemahasiswaan@del.ac.id
                            </span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* Latest News Section */}
            <div style={styles.latestNews}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Berita Terbaru</h2>
                </div>
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
                    <div style={styles.newsGrid}>
                        {news.length > 0 ? (
                            news.map((item) => (
                                <Link
                                    key={item.news_id}
                                    href={`/news/${item.news_id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div
                                        style={styles.newsCard}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = styles.cardHover.transform;
                                            e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
                                            const img = e.currentTarget.querySelector('img');
                                            if (img) img.style.transform = styles.cardImgHover.transform;
                                            e.currentTarget.querySelector('a').style.background =
                                                styles.cardButtonHover.background;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                                            const img = e.currentTarget.querySelector('img');
                                            if (img) img.style.transform = 'none';
                                            e.currentTarget.querySelector('a').style.background =
                                                styles.cardButton.background;
                                        }}
                                    >
                                        <div style={styles.newsCardImgContainer}>
                                            {item.image ? (
                                                <img
                                                    style={styles.cardImg}
                                                    src={`/storage/${item.image}`}
                                                    alt={item.title}
                                                />
                                            ) : item.file ? (
                                                <div style={styles.cardIconContainer}>
                                                    <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div style={styles.cardIconContainer}>
                                                    <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <div style={styles.cardCategory}>
                                                {item.category ? item.category.category_name : 'Uncategorized'}
                                            </div>
                                        </div>
                                        <div style={styles.cardContent}>
                                            <h3 style={styles.cardTitle}>{item.title}</h3>
                                            <p style={styles.cardDescription}>
                                                {item.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'}
                                            </p>
                                            <div style={styles.cardDate}>
                                                <svg
                                                    style={styles.cardDateIcon}
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
                                                {formatDate(item.created_at)}
                                            </div>
                                            <Link
                                                href={`/news/${item.news_id}`}
                                                style={styles.cardButton}
                                            >
                                                Baca Selengkapnya
                                            </Link>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <svg
                                    style={styles.emptyStateIcon}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                                <h3 style={styles.emptyStateTitle}>Tidak ada berita</h3>
                                <p style={styles.emptyStateText}>Silakan periksa kembali nanti.</p>
                            </div>
                        )}
                    </div>
                )}
                <div style={styles.viewAllButtonContainer}>
                    <Link
                        href="/newsguest"
                        style={styles.viewAllButton}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = styles.viewAllButtonHover.background)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = styles.viewAllButton.background)
                        }
                    >
                        Lihat Semua Berita
                    </Link>
                </div>
            </div>

            {/* Latest Announcements Section */}
            <div style={styles.latestAnnouncements}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Pengumuman Terbaru</h2>
                </div>
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
                    <div style={styles.announcementGrid}>
                        {announcements.length > 0 ? (
                            announcements.map((item) => (
                                <Link
                                    key={item.announcement_id}
                                    href={`/announcement/${item.announcement_id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div
                                        style={styles.announcementCard}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = styles.cardHover.transform;
                                            e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
                                            const img = e.currentTarget.querySelector('img');
                                            if (img) img.style.transform = styles.cardImgHover.transform;
                                            e.currentTarget.querySelector('a').style.background =
                                                styles.cardButtonHover.background;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                                            const img = e.currentTarget.querySelector('img');
                                            if (img) img.style.transform = 'none';
                                            e.currentTarget.querySelector('a').style.background =
                                                styles.cardButton.background;
                                        }}
                                    >
                                        <div style={styles.announcementCardImgContainer}>
                                            {item.file && item.file.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                <img
                                                    style={styles.cardImg}
                                                    src={`/storage/${item.file}`}
                                                    alt={item.title}
                                                />
                                            ) : item.file ? (
                                                <div style={styles.cardIconContainer}>
                                                    <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div style={styles.cardIconContainer}>
                                                    <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <div style={styles.cardCategory}>
                                                {item.category ? item.category.category_name : 'Uncategorized'}
                                            </div>
                                        </div>
                                        <div style={styles.cardContent}>
                                            <h3 style={styles.cardTitle}>{item.title}</h3>
                                            <p style={styles.cardDescription}>
                                                {item.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'}
                                            </p>
                                            <div style={styles.cardDate}>
                                                <svg
                                                    style={styles.cardDateIcon}
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
                                                {formatDate(item.created_at)}
                                            </div>
                                            <Link
                                                href={`/announcement/${item.announcement_id}`}
                                                style={styles.cardButton}
                                            >
                                                Baca Selengkapnya
                                            </Link>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <svg
                                    style={styles.emptyStateIcon}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a Punya2 a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10z"
                                    />
                                </svg>
                                <h3 style={styles.emptyStateTitle}>Tidak ada pengumuman</h3>
                                <p style={styles.emptyStateText}>Silakan periksa kembali nanti.</p>
                            </div>
                        )}
                    </div>
                )}
                <div style={styles.viewAllButtonContainer}>
                    <Link
                        href="/announcement"
                        style={styles.viewAllButton}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = styles.viewAllButtonHover.background)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = styles.viewAllButton.background)
                        }
                    >
                        Lihat Semua Pengumuman
                    </Link>
                </div>
            </div>

            {/* Achievements Section */}
            <div style={styles.achievementsSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Prestasi</h2>
                </div>
                <div style={styles.achievementContainer}>
                    {/* International Achievements */}
                    <div style={styles.achievementBox}>
                        <div style={styles.achievementTotal}>
                            {getTotalAchievements('International')}
                        </div>
                        <div style={styles.achievementLabel}>Prestasi Internasional</div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Gold</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['International']['Gold']} Medali
                            </span>
                        </div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Silver</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['International']['Silver']} Medali
                            </span>
                        </div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Bronze</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['International']['Bronze']} Medali
                            </span>
                        </div>
                    </div>

                    {/* National Achievements */}
                    <div style={styles.achievementBox}>
                        <div style={styles.achievementTotal}>
                            {getTotalAchievements('National')}
                        </div>
                        <div style={styles.achievementLabel}>Prestasi Nasional</div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Gold</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['National']['Gold']} Medali
                            </span>
                        </div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Silver</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['National']['Silver']} Medali
                            </span>
                        </div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Bronze</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['National']['Bronze']} Medali
                            </span>
                        </div>
                    </div>

                    {/* Regional Achievements */}
                    <div style={styles.achievementBox}>
                        <div style={styles.achievementTotal}>
                            {getTotalAchievements('Regional')}
                        </div>
                        <div style={styles.achievementLabel}>Prestasi Regional</div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Gold</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['Regional']['Gold']} Medali
                            </span>
                        </div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Silver</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['Regional']['Silver']} Medali
                            </span>
                        </div>
                        <div style={styles.achievementDetail}>
                            <span style={styles.achievementDetailLabel}>Bronze</span>
                            <span style={styles.achievementDetailValue}>
                                {achievements['Regional']['Bronze']} Medali
                            </span>
                        </div>
                    </div>
                </div>
                <div style={styles.viewAllButtonContainer}>
                    <Link
                        href="/achievements"
                        style={styles.viewAllButton}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = styles.viewAllButtonHover.background)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = styles.viewAllButton.background)
                        }
                    >
                        Lihat Detail Prestasi
                    </Link>
                </div>
            </div>
            {/* Tambahkan Chatbot Widget */}
            <ChatbotWidget />

            <FooterLayout />
        </GuestLayout>
    );
}