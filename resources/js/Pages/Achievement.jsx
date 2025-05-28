import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Achievement({ achievements, flash }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [metaData, setMetaData] = useState(null);
    const [metaError, setMetaError] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [announcementError, setAnnouncementError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Increased to 8 to show 4 cards per row across 2 rows

    // Calculate pagination
    const totalPages = Math.ceil((achievements?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAchievements = achievements?.slice(startIndex, endIndex) || [];

    useEffect(() => {
        setIsLoaded(true);

        const cards = document.querySelectorAll('.achievement-card');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        cards.forEach((card) => observer.observe(card));

        const fetchData = async () => {
            try {
                const metaResponse = await fetch('https://kemahasiswaanitdel.site/api/meta/prestasi');
                if (!metaResponse.ok) throw new Error('Gagal mengambil data meta prestasi');
                const metaData = await metaResponse.json();
                setMetaData(metaData);

                const announcementsResponse = await fetch('https://kemahasiswaanitdel.site/api/announcements');
                if (!announcementsResponse.ok) throw new Error('Gagal mengambil data pengumuman');
                const announcementsData = await announcementsResponse.json();
                console.log('Announcements:', announcementsData.data); // Log to verify ID field
                setAnnouncements(announcementsData.data || []);
            } catch (err) {
                if (err.message.includes('meta')) setMetaError(err.message);
                else setAnnouncementError(err.message);
            }
        };

        fetchData();
        return () => observer.disconnect();
    }, []);

    const filterCompetitionAnnouncements = (announcements) => {
        const competitionKeywords = ['kompetisi', 'lomba', 'pertandingan', 'kejuaraan', 'perlombaan'];
        return announcements
            .filter((announcement) => announcement)
            .filter((announcement) => {
                const title = announcement.title?.toLowerCase() || '';
                const content = announcement.content?.toLowerCase().replace(/<[^>]+>/g, '') || '';
                const category = announcement.category?.category_name?.toLowerCase() || '';
                return (
                    category.includes('kompetisi') ||
                    competitionKeywords.some((keyword) => title.includes(keyword) || content.includes(keyword))
                );
            });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak tersedia';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const competitionAnnouncements = filterCompetitionAnnouncements(announcements).slice(0, 3);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const styles = {
        container: {
            maxWidth: '1500px',
            padding: '20px',
            margin: '0 auto',
            backgroundColor: '#F5F7FA',
            minHeight: '100vh',
            fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            position: 'relative',
        },
        mainLayout: {
            maxWidth: '1500px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            gap: '30px',
            position: 'relative',
            '@media (max-width: 1500px)': {
                flexDirection: 'column',
            },
        },
        mainContent: {
            flex: '1',
            minWidth: 0,
        },
        sectionHeader: {
            marginBottom: '40px',
            textAlign: 'center',
        },
        headerTitle: {
            color: '#1e293b',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
        },
        headerSubtitle: {
            color: '#64748b',
            fontSize: '1.1rem',
            fontWeight: '400',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto',
        },
        sidebar: {
            width: '320px',
            height:'630px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            '@media (max-width: 1024px)': {
                width: '100%',
                marginBottom: '30px',
            },
        },
        sidebarTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        sidebarIcon: {
            width: '20px',
            height: '20px',
            background: '#3b82f6',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
        },
        announcementCard: {
            background: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            display: 'block',
        },
        announcementCardHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderColor: '#3b82f6',
        },
        announcementTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
        },
        announcementContent: {
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
        },
        announcementDate: {
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: '500',
        },
        achievementGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', // Reduced min width to fit 4 cards
            gap: '20px', // Slightly reduced gap for tighter layout
            marginBottom: '40px',
        },
        achievementCard: {
            background: '#ffffff',
            borderRadius: '10px', // Slightly smaller border radius
            overflow: 'hidden',
            boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.1)', // Lighter shadow
            border: '1px solid #e2e8f0',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all 0.6s ease',
            position: 'relative',
        },
        cardLoaded: {
            opacity: 1,
            transform: 'translateY(0)',
        },
        cardImageContainer: {
            position: 'relative',
            height: '160px', // Reduced image height
            overflow: 'hidden',
        },
        cardImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
        },
        cardImageOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
        },
        cardContent: {
            padding: '16px', // Reduced padding
        },
        cardTitle: {
            fontSize: '16px', // Smaller font size
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.3',
        },
        cardDescription: {
            fontSize: '13px', // Smaller font size
            color: '#64748b',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
        },
        detailsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px', // Reduced gap
        },
        cardDetail: {
            fontSize: '12px', // Smaller font size
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px', // Reduced padding
            background: '#f8fafc',
            borderRadius: '5px',
        },
        cardDetailIcon: {
            width: '14px', // Smaller icon
            height: '14px',
            marginRight: '6px',
            color: '#3b82f6',
        },
        detailLabel: {
            fontWeight: '600',
            marginRight: '5px',
            color: '#475569',
        },
        detailValue: {
            color: '#64748b',
        },
        medalContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px', // Reduced padding
            borderRadius: '6px',
            marginBottom: '10px',
        },
        medalIcon: {
            width: '16px', // Smaller icon
            height: '16px',
            marginRight: '6px',
        },
        medalLabel: {
            fontWeight: '600',
            fontSize: '11px', // Smaller font size
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '50px 30px', // Slightly smaller padding
            background: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
        },
        emptyStateIcon: {
            width: '56px', // Smaller icon
            height: '56px',
            color: '#cbd5e1',
            marginBottom: '12px',
        },
        emptyStateTitle: {
            fontSize: '18px', // Smaller font size
            fontWeight: '600',
            color: '#475569',
            marginBottom: '6px',
        },
        emptyStateText: {
            color: '#64748b',
            fontSize: '13px', // Smaller font size
            textAlign: 'center',
            lineHeight: '1.5',
        },
        metaCard: {
            background: '#ffffff',
            borderRadius: '10px',
            padding: '30px 20px', // Slightly smaller padding
            boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            marginBottom: '30px',
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '30px',
        },
        paginationButton: {
            padding: '6px 10px', // Smaller padding
            borderRadius: '5px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#64748b',
            fontSize: '13px', // Smaller font size
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        paginationButtonActive: {
            background: '#3b82f6',
            color: '#ffffff',
            borderColor: '#3b82f6',
        },
        paginationButtonHover: {
            background: '#f8fafc',
            borderColor: '#3b82f6',
            color: '#3b82f6',
        },
        paginationInfo: {
            color: '#64748b',
            fontSize: '13px', // Smaller font size
            fontWeight: '500',
            padding: '0 12px',
        },
    };

    const getMedalStyle = (medal) => {
        switch (medal) {
            case 'Gold':
                return {
                    background: '#fef3c7',
                    color: '#92400e',
                };
            case 'Silver':
                return {
                    background: '#f1f5f9',
                    color: '#475569',
                };
            case 'Bronze':
                return {
                    background: '#fef2f2',
                    color: '#991b1b',
                };
            default:
                return {
                    background: '#f8fafc',
                    color: '#64748b',
                };
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return (
            <div style={styles.pagination}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        ...styles.paginationButton,
                        opacity: currentPage === 1 ? 0.5 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                            Object.assign(e.target.style, styles.paginationButtonHover);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (currentPage !== 1) {
                            Object.assign(e.target.style, styles.paginationButton);
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Sebelumnya
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            style={styles.paginationButton}
                            onMouseEnter={(e) => Object.assign(e.target.style, styles.paginationButtonHover)}
                            onMouseLeave={(e) => Object.assign(e.target.style, styles.paginationButton)}
                        >
                            1
                        </button>
                        {startPage > 2 && <span style={styles.paginationInfo}>...</span>}
                    </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                            ...styles.paginationButton,
                            ...(page === currentPage ? styles.paginationButtonActive : {}),
                        }}
                        onMouseEnter={(e) => {
                            if (page !== currentPage) {
                                Object.assign(e.target.style, styles.paginationButtonHover);
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (page !== currentPage) {
                                Object.assign(e.target.style, styles.paginationButton);
                            } else {
                                Object.assign(e.target.style, { ...styles.paginationButton, ...styles.paginationButtonActive });
                            }
                        }}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span style={styles.paginationInfo}>...</span>}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            style={styles.paginationButton}
                            onMouseEnter={(e) => Object.assign(e.target.style, styles.paginationButtonHover)}
                            onMouseLeave={(e) => Object.assign(e.target.style, styles.paginationButton)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        ...styles.paginationButton,
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                            Object.assign(e.target.style, styles.paginationButtonHover);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (currentPage !== totalPages) {
                            Object.assign(e.target.style, styles.paginationButton);
                        }
                    }}
                >
                    Selanjutnya
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </button>

                <div style={styles.paginationInfo}>
                    Halaman {currentPage} dari {totalPages} ({achievements?.length || 0} total prestasi)
                </div>
            </div>
        );
    };

    return (
        <GuestLayout>
            <Head title="Prestasi" />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.mainLayout}>
                    <div style={styles.mainContent}>
                        {/* Meta Section */}
                        <div style={styles.sectionHeader}>
                            {metaError ? (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{metaError}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : metaData ? (
                                <div style={styles.metaCard}>
                                    <h1 style={styles.headerTitle}>{metaData.meta_title || 'Prestasi Mahasiswa'}</h1>
                                    <div
                                        style={styles.headerSubtitle}
                                        dangerouslySetInnerHTML={{
                                            __html: metaData.meta_description || 'Kumpulan prestasi membanggakan yang telah diraih oleh mahasiswa dalam berbagai kompetisi dan bidang.',
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={styles.metaCard}>
                                    <h1 style={styles.headerTitle}>Prestasi Mahasiswa</h1>
                                    <p style={styles.headerSubtitle}>Memuat data prestasi...</p>
                                </div>
                            )}
                        </div>

                        {/* Achievement Grid */}
                        <div style={styles.achievementGrid}>
                            {currentAchievements?.length > 0 ? (
                                currentAchievements.map((achievement, index) => (
                                    <div
                                        key={achievement.achievement_id}
                                        className="achievement-card"
                                        style={{
                                            ...styles.achievementCard,
                                            ...(isLoaded && { ...styles.cardLoaded }),
                                            transitionDelay: `${index * 0.1}s`,
                                        }}
                                        onMouseEnter={(e) => {
                                            const img = e.currentTarget.querySelector('img');
                                            const overlay = e.currentTarget.querySelector('.card-overlay');
                                            if (img) img.style.transform = 'scale(1.05)';
                                            if (overlay) overlay.style.opacity = '1';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            const img = e.currentTarget.querySelector('img');
                                            const overlay = e.currentTarget.querySelector('.card-overlay');
                                            if (img) img.style.transform = 'scale(1)';
                                            if (overlay) overlay.style.opacity = '0';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 3px 5px -1px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <div style={styles.cardImageContainer}>
                                            {achievement.image ? (
                                                <>
                                                    <img
                                                        src={`/storage/${achievement.image}`}
                                                        alt={achievement.title || 'Achievement Image'}
                                                        style={styles.cardImage}
                                                        onError={(e) => {
                                                            e.target.outerHTML = `
                                                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; height: 100%; color: #94a3b8;">
                                                                    <svg style="width: 40px; height: 40px; margin-bottom: 6px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                                                                    </svg>
                                                                    <span style="font-size: 11px; font-weight: 500;">Gambar tidak tersedia</span>
                                                                </div>
                                                            `;
                                                        }}
                                                    />
                                                    <div className="card-overlay" style={styles.cardImageOverlay}></div>
                                                </>
                                            ) : (
                                                <div
                                                    style={{
                                                        height: '160px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: '#f8fafc',
                                                        color: '#94a3b8',
                                                    }}
                                                >
                                                    <svg
                                                        style={{ width: '40px', height: '40px', marginBottom: '6px' }}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span style={{ fontSize: '11px', fontWeight: '500' }}>Tidak ada gambar</span>
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.cardContent}>
                                            <h3 style={styles.cardTitle}>{achievement.title || 'Tanpa Judul'}</h3>
                                            <p style={styles.cardDescription}>{achievement.description || 'Tidak ada deskripsi'}</p>

                                            {achievement.medal && (
                                                <div style={{ ...styles.medalContainer, ...getMedalStyle(achievement.medal) }}>
                                                    <svg style={styles.medalIcon} viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                    <span style={styles.medalLabel}>{achievement.medal}</span>
                                                </div>
                                            )}

                                            <div style={styles.detailsContainer}>
                                                <div style={styles.cardDetail}>
                                                    <svg style={styles.cardDetailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                        />
                                                    </svg>
                                                    <span style={styles.detailLabel}>Kategori:</span>
                                                    <span style={styles.detailValue}>{achievement.category || 'Tidak ada kategori'}</span>
                                                </div>

                                                <div style={styles.cardDetail}>
                                                    <svg style={styles.cardDetailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                    <span style={styles.detailLabel}>Jenis:</span>
                                                    <span style={styles.detailValue}>{achievement.type || 'Tidak ada jenis'}</span>
                                                </div>

                                                <div style={styles.cardDetail}>
                                                    <svg style={styles.cardDetailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span style={styles.detailLabel}>Tanggal:</span>
                                                    <span style={styles.detailValue}>{formatDate(achievement.date)}</span>
                                                </div>

                                                <div style={styles.cardDetail}>
                                                    <svg style={styles.cardDetailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                    </svg>
                                                    <span style={styles.detailLabel}>Lokasi:</span>
                                                    <span style={styles.detailValue}>{achievement.location || 'Tidak ada lokasi'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyState}>
                                    <svg style={styles.emptyStateIcon} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            fillRule="evenodd"
                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <h3 style={styles.emptyStateTitle}>Tidak Ada Prestasi</h3>
                                    <p style={styles.emptyStateText}>
                                        Belum ada prestasi yang tersedia saat ini. Silakan cek kembali nanti atau hubungi administrator.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </div>

                    {/* Sidebar */}
                    <aside style={styles.sidebar}>
                        <div style={styles.sidebarTitle}>
                            <div style={styles.sidebarIcon}>
                                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '14px', height: '14x', color: '#ffffff' }}>
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            Pengumuman Kompetisi
                        </div>
                        {announcementError ? (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{announcementError}</p>
                                    </div>
                                </div>
                            </div>
                        ) : competitionAnnouncements.length > 0 ? (
                            competitionAnnouncements.map((announcement) => (
                                <Link
                                    key={announcement.id}
                                    href={`/announcements/${announcement.id}`} // Fixed URL and ID field
                                    style={styles.announcementCard}
                                    onMouseEnter={(e) => Object.assign(e.target.style, styles.announcementCardHover)}
                                    onMouseLeave={(e) => Object.assign(e.target.style, styles.announcementCard)}
                                >
                                    <h4 style={styles.announcementTitle}>{announcement.title || 'Tanpa Judul'}</h4>
                                    <p
                                        style={styles.announcementContent}
                                        dangerouslySetInnerHTML={{
                                            __html: announcement.content?.replace(/<[^>]+>/g, '') || 'Tidak ada konten',
                                        }}
                                    />
                                    <p style={styles.announcementDate}>{formatDate(announcement.created_at)}</p>
                                </Link>
                            ))
                        ) : (
                            <div style={styles.announcementCard}>
                                <p style={styles.announcementContent}>Tidak ada pengumuman kompetisi saat ini.</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}