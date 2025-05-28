import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';

export default function Home() {
    const swiperElRef = useRef(null);
    const newsSectionRef = useRef(null);
    const achievementsSectionRef = useRef(null);
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [achievements, setAchievements] = useState({
        International: { Gold: 0, Silver: 0, Bronze: 0 },
        National: { Gold: 0, Silver: 0, Bronze: 0 },
        Regional: { Gold: 0, Silver: 0, Bronze: 0 },
    });
    const [carousels, setCarousels] = useState([]);
    const [metaData, setMetaData] = useState(null); // Ganti dari director ke metaData
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [carouselLoading, setCarouselLoading] = useState(true);
    const [carouselError, setCarouselError] = useState(null);
    const [metaError, setMetaError] = useState(null); // Ganti dari directorError ke metaError
    const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
    const [isNewsVisible, setIsNewsVisible] = useState(false);
    const [isAchievementsVisible, setIsAchievementsVisible] = useState(false);
    const welcomeSectionRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const newsResponse = await fetch('/api/news?per_page=4');
                if (!newsResponse.ok) throw new Error('Gagal mengambil data berita');
                const newsData = await newsResponse.json();
                setNews(newsData.data || []);

                const categoriesResponse = await fetch('/api/news-categories');
                if (!categoriesResponse.ok) throw new Error('Gagal mengambil data kategori');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                const announcementsResponse = await fetch('/api/announcements?per_page=4');
                if (!announcementsResponse.ok) throw new Error('Gagal mengambil data pengumuman');
                const announcementsData = await announcementsResponse.json();
                setAnnouncements(announcementsData.data || []);

                const activitiesResponse = await fetch('/api/activities/nearest');
                if (!activitiesResponse.ok) throw new Error('Gagal mengambil data kegiatan terdekat');
                const activitiesData = await activitiesResponse.json();
                setActivities(activitiesData || []);

                const achievementsResponse = await fetch('/api/achievements-grouped');
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
                const carouselResponse = await fetch('/api/carousel/guest');
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

        const fetchMetaData = async () => { // Ganti dari fetchDirector ke fetchMetaData
            try {
                const metaResponse = await fetch('/api/meta/kata-sambutan');
                if (!metaResponse.ok) throw new Error('Gagal mengambil data meta');
                const metaData = await metaResponse.json();
                setMetaData(metaData);
            } catch (err) {
                console.error('Error fetching meta data:', err);
                setMetaError('Gagal memuat kata sambutan. Silakan coba lagi nanti.');
            }
        };

        fetchData();
        fetchCarousels();
        fetchMetaData();
    }, []);

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
                const shouldLoop = carousels.length > 1;
                swiperInstance = new Swiper('.swiper-container', {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    loop: shouldLoop,
                    speed: 1000,
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                    keyboard: { enabled: true, onlyInViewport: true },
                    autoplay: { delay: 5000, disableOnInteraction: false },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                        disabledClass: 'swiper-button-disabled',
                    },
                });
            }
        };

        return () => {
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
            }
            if (swiperStyles.parentNode) document.head.removeChild(swiperStyles);
            if (swiperScript.parentNode) document.body.removeChild(swiperScript);
        };
    }, [carousels]);

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

    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    // Proximity Zoom Effect for News Cards
    useEffect(() => {
        const newsSection = newsSectionRef.current;
        if (!newsSection) return;

        const handleMouseMove = (e) => {
            const cards = newsSection.querySelectorAll('.news-card');
            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                // Calculate distance between mouse and card center
                const distance = Math.sqrt(
                    Math.pow(mouseX - cardCenterX, 2) + Math.pow(mouseY - cardCenterY, 2)
                );

                // Apply zoom if mouse is within 150px
                if (distance < 150) {
                    card.style.transform = 'scale(1.05)';
                    card.style.zIndex = '10'; // Ensure zoomed card is above others
                } else {
                    card.style.transform = 'scale(1)';
                    card.style.zIndex = '1';
                }
            });
        };

        // Throttle mousemove to improve performance
        let throttleTimeout;
        const throttledMouseMove = (e) => {
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    handleMouseMove(e);
                    throttleTimeout = null;
                }, 16); // ~60fps
            }
        };

        newsSection.addEventListener('mousemove', throttledMouseMove);

        return () => {
            newsSection.removeEventListener('mousemove', throttledMouseMove);
            clearTimeout(throttleTimeout);
        };
    }, [isNewsVisible]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getTotalAchievements = (category) => {
        return (
            achievements[category]['Gold'] +
            achievements[category]['Silver'] +
            achievements[category]['Bronze']
        );
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target === welcomeSectionRef.current) {
                            setIsWelcomeVisible(true);
                        } else if (entry.target === newsSectionRef.current) {
                            setIsNewsVisible(true);
                        } else if (entry.target === achievementsSectionRef.current) {
                            setIsAchievementsVisible(true);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (welcomeSectionRef.current) observer.observe(welcomeSectionRef.current);
        if (newsSectionRef.current) observer.observe(newsSectionRef.current);
        if (achievementsSectionRef.current) observer.observe(achievementsSectionRef.current);

        return () => {
            if (welcomeSectionRef.current) observer.unobserve(welcomeSectionRef.current);
            if (newsSectionRef.current) observer.unobserve(newsSectionRef.current);
            if (achievementsSectionRef.current) observer.unobserve(achievementsSectionRef.current);
        };
    }, []);

    // Button click effect
    const handleButtonClick = (e) => {
        const button = e.currentTarget;
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 300);
    };

    const styles = {
        body: {
            fontFamily: "'Inter', sans-serif",
            margin: 0,
            padding: 0,
            background: '#F5F7FA',
            minHeight: '100vh',
        },
        emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            animation: 'fadeIn 0.5s ease-out',
        },
        emptyStateIcon: {
            width: '48px',
            height: '48px',
            color: '#9ca3af',
            marginBottom: '12px',
        },
        emptyStateTitle: {
            fontSize: '18px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px',
        },
        emptyStateText: {
            fontSize: '13px',
            color: '#6b7280',
        },
        loadingState: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '150px',
        },
        errorMessage: {
            textAlign: 'center',
            color: '#e53e3e',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            marginBottom: '16px',
            animation: 'fadeIn 0.5s ease-out',
        },
        newsAndAnnouncementsSection: {
            padding: '64px 0',
            background: '#F5F7FA',
            position: 'relative',
            overflow: 'hidden',
            opacity: isNewsVisible ? 1 : 0,
            transform: isNewsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        },
        sectionContainer: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px',
        },
        sectionHeader: {
            width: '100%',
            marginBottom: '32px',
            textAlign: 'center',
            animation: 'slideUp 0.6s ease-out',
        },
        sectionTitle: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            position: 'relative',
            display: 'inline-block',
            ':after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                background: '#3B82F6',
                borderRadius: '2px',
            },
        },
        sectionSubtitle: {
            fontSize: '16px',
            color: '#6b7280',
            marginTop: '8px',
        },
        sidebarContainer: {
            flex: '0 0 250px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
        },
        announcementsSidebar: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
            padding: '16px',
            height: '400px',
            minHeight: '400px',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideUp 0.7s ease-out 0.2s both',
            position: 'relative',
            overflowY: 'auto',
        },
        sidebarTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '12px',
        },
        sidebarItem: {
            padding: '8px 0',
            borderBottom: '1px solid #e5e7eb',
            transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            background: 'transparent',
            ':hover': {
                transform: 'translateX(6px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(90deg, #E0F2FE, #BFDBFE, #E0F2FE)',
                backgroundSize: '200% 100%',
                animation: 'gradientMove 2s ease infinite',
            },
            ':before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '4px',
                background: '#3B82F6',
                transform: 'scaleY(0)',
                transformOrigin: 'bottom',
                transition: 'transform 0.3s ease',
            },
            ':hover:before': {
                transform: 'scaleY(1)',
            },
        },
        sidebarItemTitle: {
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        sidebarItemDate: {
            fontSize: '11px',
            color: '#6b7280',
        },
        sidebarButton: {
            display: 'block',
            width: '100%',
            background: '#DBEAFE',
            color: '#3B82F6',
            padding: '12px 0',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            transition: 'background 0.2s ease, color 0.2s ease, transform 0.2s ease',
            marginTop: '32px',
            ':hover': {
                background: '#BFDBFE',
                color: '#1D4ED8',
                transform: 'scale(1.02)',
            },
            ':focus': {
                outline: '2px solid #3B82F6',
                outlineOffset: '2px',
            },
        },
        activitiesSidebar: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
            padding: '16px',
            minHeight: '400px',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideUp 0.7s ease-out 0.3s both',
            overflowY: 'auto',
        },
        activityItem: {
            padding: '6px 0',
            borderBottom: '1px solid #e5e7eb',
            transition: 'background 0.3s ease, transform 0.2s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxHeight: '120px',
            overflow: 'hidden',
            ':hover': {
                background: '#E0F2FE',
                transform: 'translateX(4px)',
            },
        },
        activityDateBox: {
            background: '#3B82F6',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '4px 8px',
            textAlign: 'center',
            width: '60px',
            height: '50px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative',
            ':hover': {
                transform: 'rotate(10deg) scale(1.15)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.7)',
            },
            ':before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '10px',
                background: 'linear-gradient(45deg, #3B82F6, #60A5FA, #3B82F6)',
                backgroundSize: '200% 200%',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: -1,
            },
            ':hover:before': {
                opacity: 1,
                animation: 'glow 1.5s ease-in-out infinite',
            },
        },
        activityDay: {
            fontSize: '18px',
            fontWeight: '600',
            lineHeight: '1',
            marginBottom: '2px',
        },
        activityMonth: {
            fontSize: '12px',
            fontWeight: '400',
            textTransform: 'uppercase',
            lineHeight: '1',
        },
        activityContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
        },
        activityItemTitle: {
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        activityItemDate: {
            fontSize: '11px',
            color: '#6b7280',
        },
        newsGrid: {
            flex: '1',
            minWidth: '300px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: '20px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                gridTemplateRows: 'auto',
            },
        },
        newsCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            animation: 'slideUp 0.6s ease-out both',
            height: '400.5px',
            minHeight: '400.5px',
            maxHeight: '400.5px',
            display: 'flex',
            flexDirection: 'column',
            ':hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
            },
            ':before': {
                content: '""',
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1), transparent)',
                opacity: '0',
                transition: 'opacity 0.3s ease',
            },
            ':hover:before': {
                opacity: '1',
            },
        },
        newsImgContainer: {
            height: '250px',
            overflow: 'hidden',
            position: 'relative',
        },
        newsImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            ':hover': {
                transform: 'scale(1.08)',
            },
        },
        newsIconContainer: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
        },
        newsIcon: {
            width: '40px',
            height: '40px',
            color: '#6b7280',
        },
        newsCategory: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: '#3B82F6',
            color: '#ffffff',
            padding: '4px 10px',
            fontSize: '11px',
            borderRadius: '4px',
            transition: 'transform 0.3s ease',
            ':hover': {
                transform: 'scale(1.1)',
                animation: 'bounce 0.4s ease',
            },
        },
        newsContent: {
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flex: 1,
            overflow: 'hidden',
        },
        newsTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        newsDescription: {
            fontSize: '13px',
            color: 'rgb(75 85 99)',
            display: '-webkit-box',
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        newsDate: {
            fontSize: '11px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        newsDateIcon: {
            width: '14px',
            height: '14px',
        },
        viewAllButtonContainer: {
            textAlign: 'center',
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
        },
        viewAllButton: {
            display: 'block',
            width: '100%',
            background: '#DBEAFE',
            color: '#3B82F6',
            padding: '12px 0',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            transition: 'background 0.2s ease, color 0.2s ease, transform 0.2s ease',
            marginTop: '32px',
            maxWidth: '200px',
            ':hover': {
                background: '#BFDBFE',
                color: '#1D4ED8',
                transform: 'scale(1.02)',
            },
            ':focus': {
                outline: '2px solid #3B82F6',
                outlineOffset: '2px',
            },
        },
        welcomeSection: {
            padding: '48px 0',
            background: '#F5F7FA',
            opacity: isWelcomeVisible ? 1 : 0,
            transform: isWelcomeVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        },
        welcomeContainer: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '32px',
            alignItems: 'start',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                textAlign: 'center',
            },
        },
        welcomePhotoContainer: {
            width: '320px',
            height: '400px',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            background: '#f3f4f6',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out, filter 0.8s ease-out',
            opacity: isWelcomeVisible ? 1 : 0,
            transform: isWelcomeVisible ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.9)',
            filter: isWelcomeVisible ? 'blur(0)' : 'blur(5px)',
        },
        welcomePhoto: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },
        welcomePhotoPlaceholder: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '16px',
        },
        welcomeName: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '16px',
            textAlign: 'left',
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s, filter 0.8s ease-out 0.2s',
            opacity: isWelcomeVisible ? 1 : 0,
            transform: isWelcomeVisible ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.95)',
            filter: isWelcomeVisible ? 'blur(0)' : 'blur(3px)',
        },
        welcomeMessage: {
            fontSize: '15px',
            color: '#4b5563',
            lineHeight: '1.7',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px 12px 12px 0',
            padding: '21px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            maxHeight: '350px',
            overflowY: 'auto',
            textAlign: 'justify',
            position: 'relative',
            transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s, filter 0.8s ease-out 0.4s',
            opacity: isWelcomeVisible ? 1 : 0,
            transform: isWelcomeVisible ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.95)',
            filter: isWelcomeVisible ? 'blur(0)' : 'blur(3px)',
            zIndex: 1,
            ':after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '30px',
                width: '0',
                height: '0',
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '12px solid rgba(255, 255, 255, 0.95)',
                zIndex: 0,
                transform: 'translateX(-50%)',
            },
        },
        achievementsSection: {
            padding: '48px 0',
            background: '#F5F7FA',
            opacity: isAchievementsVisible ? 1 : 0,
            transform: isAchievementsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        },
        achievementChartsContainer: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            justifyContent: 'center',
        },
        achievementBox: {
            background: '#F8FAFC',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '2px solid #BFDBFE',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            animation: 'slideUp 0.6s ease-out both',
            ':hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                background: '#E0F2FE',
            },
        },
        achievementTotal: {
            fontSize: '36px',
            fontWeight: '700',
            color: '#3B82F6',
            marginBottom: '8px',
            background: '#DBEAFE',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'inline-block',
        },
        achievementLabel: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px',
        },
        achievementDetail: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            textAlign: 'left',
        },
        achievementDetailLabel: {
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500',
        },
        achievementDetailValue: {
            fontSize: '14px',
            color: '#3B82F6',
            fontWeight: '600',
            textAlign: 'right',
        },
        '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
        },
        '@keyframes slideUp': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes bounce': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.15)' },
        },
        '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(0.95)' },
            '100%': { transform: 'scale(1)' },
        },
        '@keyframes gradientMove': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
        '@keyframes glow': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
    };

    return (
        <GuestLayout>
            <Head title="Beranda" />
            <Navbar showBreadcrumbAndHeader={false} />

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
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">@kemahasiswaanitdel</span>
                        </a>
                        <a
                            href="https://wa.me/+6285142232595"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-green-500 p-3">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">Kemahasiswaan</span>
                        </a>
                        <a
                            href="https://www.tiktok.com/@institut.teknologi.del"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-black p-3">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.49v-3.88a4.85 4.85 0 01-1.2 0z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">@it.del</span>
                        </a>
                        <a
                            href="https://www.youtube.com/@institutteknologidel1337"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-white transition-colors hover:text-blue-200"
                        >
                            <div className="rounded-full bg-red-600 p-3">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </div>
                            <span className="text-base font-medium">Institut Teknologi Del</span>
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
                            <span className="text-base font-medium">kemahasiswaan@del.ac.id</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Welcome Message Section */}
            <div style={styles.welcomeSection} ref={welcomeSectionRef}>
                <div style={styles.welcomeContainer}>
                    <div style={styles.welcomePhotoContainer}>
                        {metaError ? (
                            <div style={styles.welcomePhotoPlaceholder}>Gagal memuat foto</div>
                        ) : metaData && metaData.file_path ? (
                            <img
                                style={styles.welcomePhoto}
                                src={`/storage/${metaData.file_path}`}
                                alt={metaData.meta_title || 'Foto Direktur'}
                            />
                        ) : (
                            <div style={styles.welcomePhotoPlaceholder}>Tidak ada foto tersedia</div>
                        )}
                    </div>
                    <div>
                        {metaData && (
                            <h3 style={styles.welcomeName}>{metaData.meta_title}</h3>
                        )}
                        {metaError ? (
                            <p style={styles.errorMessage}>{metaError}</p>
                        ) : metaData ? (
                            <div
                                style={styles.welcomeMessage}
                                dangerouslySetInnerHTML={{ __html: metaData.meta_description }}
                            />
                        ) : (
                            <p style={styles.welcomeMessage}>Memuat kata sambutan...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* Combined News, Announcements, and Activities Section */}
            <div style={styles.newsAndAnnouncementsSection} ref={newsSectionRef}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Berita & Pengumuman</h2>
                    <p style={styles.sectionSubtitle}>Ikuti kabar terbaru, pengumuman, dan kegiatan terdekat dari kami</p>
                </div>
                <div style={styles.sectionContainer}>
                    {/* Sidebar Container (Announcements + Activities) */}
                    <div style={styles.sidebarContainer}>
                        {/* Announcements Sidebar (3 items) */}
                        <div style={styles.announcementsSidebar}>
                            <h3 style={styles.sidebarTitle}>Pengumuman</h3>
                            {isLoading ? (
                                <div style={styles.loadingState}>
                                    <svg
                                        className="animate-spin h-6 w-6 text-blue-500"
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
                            ) : announcements.length > 0 ? (
                                announcements.slice(0, 3).map((item, index) => (
                                    <Link
                                        key={item.announcement_id}
                                        href={`/announcement/${item.announcement_id}`}
                                        style={{ textDecoration: 'none' }}
                                        aria-label={`Baca pengumuman: ${item.title}`}
                                    >
                                        <div
                                            style={{
                                                ...styles.sidebarItem,
                                                animationDelay: `${0.1 * (index + 1)}s`,
                                            }}
                                        >
                                            <h4 style={styles.sidebarItemTitle}>{item.title}</h4>
                                            <p style={styles.sidebarItemDate}>{formatDate(item.created_at)}</p>
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
                                    <h3 style={styles.emptyStateTitle}>Tidak ada pengumuman</h3>
                                    <p style={styles.emptyStateText}>Silakan periksa kembali nanti.</p>
                                </div>
                            )}
                            <Link
                                href="/announcement"
                                style={styles.sidebarButton}
                                aria-label="Lihat semua pengumuman"
                                onClick={handleButtonClick}
                            >
                                Lihat Semua Pengumuman
                            </Link>
                        </div>

                        {/* Activities Sidebar (2 items with Calendar Date Box) */}
                        <div style={styles.activitiesSidebar}>
                            <h3 style={styles.sidebarTitle}>Kegiatan Terdekat</h3>
                            {isLoading ? (
                                <div style={styles.loadingState}>
                                    <svg
                                        className="animate-spin h-6 w-6 text-blue-500"
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
                            ) : activities.length > 0 ? (
                                activities.slice(0, 3).map((item, index) => {
                                    const startDate = new Date(item.start_date);
                                    const day = startDate.getDate();
                                    const month = startDate.toLocaleString('id-ID', { month: 'short' });
                                    return (
                                        <Link
                                            key={item.id}
                                            href="/activitycalendar"
                                            style={{ textDecoration: 'none' }}
                                            aria-label={`Lihat kegiatan: ${item.title}`}
                                        >
                                            <div
                                                style={{
                                                    ...styles.activityItem,
                                                    animationDelay: `${0.1 * (index + 1)}s`,
                                                }}
                                            >
                                                <div
                                                    style={styles.activityDateBox}
                                                    aria-label={`Tanggal mulai: ${day} ${month}`}
                                                >
                                                    <span style={styles.activityDay}>{day}</span>
                                                    <span style={styles.activityMonth}>{month}</span>
                                                </div>
                                                <div style={styles.activityContent}>
                                                    <h4 style={styles.activityItemTitle}>{item.title}</h4>
                                                    <p style={styles.activityItemDate}>
                                                        {formatDate(item.start_date)} {item.end_date && `- ${formatDate(item.end_date)} `}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
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
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <h3 style={styles.emptyStateTitle}>Tidak ada kegiatan terdekat</h3>
                                    <p style={styles.emptyStateText}>Silakan periksa kembali nanti.</p>
                                </div>
                            )}
                            <Link
                                href="/activitycalendar"
                                style={styles.sidebarButton}
                                aria-label="Lihat semua kegiatan"
                                onClick={handleButtonClick}
                            >
                                Lihat Semua Kegiatan
                            </Link>
                        </div>
                    </div>

                    {/* News Grid (2x2, 4 items) */}
                    <div style={styles.newsGrid}>
                        {isLoading ? (
                            <div style={styles.loadingState}>
                                <svg
                                    className="animate-spin h-6 w-6 text-blue-500"
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
                        ) : news.length > 0 ? (
                            news.slice(0, 4).map((item, index) => (
                                <Link
                                    key={item.news_id}
                                    href={`/news/${item.news_id}`}
                                    style={{ textDecoration: 'none' }}
                                    aria-label={`Baca berita: ${item.title}`}
                                >
                                    <div
                                        className="news-card"
                                        style={{
                                            ...styles.newsCard,
                                            animationDelay: `${0.1 * (index + 1)}s`,
                                        }}
                                    >
                                        <div style={styles.newsImgContainer}>
                                            {item.image ? (
                                                <img
                                                    style={styles.newsImg}
                                                    src={`/storage/${item.image}`}
                                                    alt={item.title}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div style={styles.newsIconContainer}>
                                                    <svg
                                                        style={styles.newsIcon}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <div style={styles.newsCategory}>
                                                {item.category ? item.category.category_name : 'Uncategorized'}
                                            </div>
                                        </div>
                                        <div style={styles.newsContent}>
                                            <h3 style={styles.newsTitle}>{item.title}</h3>
                                            <p style={styles.newsDescription}>
                                                {item.content.replace(/<[^>]+>/g, '').substring(0, 80) + '...'}
                                            </p>
                                            <div style={styles.newsDate}>
                                                <svg
                                                    style={styles.newsDateIcon}
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
                </div>
            </div>

            {/* Achievements Section */}
            <div style={styles.achievementsSection} ref={achievementsSectionRef}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Prestasi</h2>
                </div>
                <div style={styles.achievementChartsContainer}>
                    {['International', 'National', 'Regional'].map((category, index) => (
                        <div
                            key={category}
                            style={{
                                ...styles.achievementBox,
                                animationDelay: `${0.2 * (index + 1)}s`,
                            }}
                        >
                            <div style={styles.achievementTotal}>
                                {getTotalAchievements(category)}
                            </div>
                            <h3 style={styles.achievementLabel}>{category}</h3>
                            <div style={styles.achievementDetail}>
                                <span style={styles.achievementDetailLabel}>Gold</span>
                                <span style={styles.achievementDetailValue}>
                                    {achievements[category]['Gold']}
                                </span>
                                <span style={styles.achievementDetailLabel}>Silver</span>
                                <span style={styles.achievementDetailValue}>
                                    {achievements[category]['Silver']}
                                </span>
                                <span style={styles.achievementDetailLabel}>Bronze</span>
                                <span style={styles.achievementDetailValue}>
                                    {achievements[category]['Bronze']}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={styles.viewAllButtonContainer}>
                    <Link
                        href="/achievements"
                        style={styles.viewAllButton}
                        aria-label="Lihat detail prestasi"
                        onClick={handleButtonClick}
                    >
                        Lihat Detail Prestasi
                    </Link>
                </div>
            </div>

            {/* Chatbot Widget */}
            <ChatbotWidget />

            <FooterLayout />
            <style jsx global>{`
                .pulse {
                    animation: pulse 0.3s ease;
                }
                .news-card {
                    position: relative;
                    transition: transform 0.3s ease, z-index 0.3s ease;
                }
            `}</style>
        </GuestLayout>
    );
}