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
                const metaResponse = await fetch('http://157.15.124.200/api/meta/prestasi');
                if (!metaResponse.ok) throw new Error('Gagal mengambil data meta prestasi');
                const metaData = await metaResponse.json();
                setMetaData(metaData);

                const announcementsResponse = await fetch('http://157.15.124.200/api/announcements');
                if (!announcementsResponse.ok) throw new Error('Gagal mengambil data pengumuman');
                const announcementsData = await announcementsResponse.json();
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

    const competitionAnnouncements = filterCompetitionAnnouncements(announcements).slice(0, 5); // Batasi ke 5 item

    const styles = {
        container: {
            padding: '60px 0',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        },
        backgroundPattern: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 125, 125, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.1) 0%, transparent 50%)
            `,
            zIndex: 0,
        },
        mainLayout: {
            maxWidth: '1300px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            gap: '30px',
            position: 'relative',
            zIndex: 1,
            '@media (max-width: 1024px)': {
                flexDirection: 'column',
            },
        },
        mainContent: {
            flex: '1',
            minWidth: 0,
        },
        sectionHeader: {
            marginBottom: '50px',
            textAlign: 'center',
        },
        headerTitle: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
        },
        headerSubtitle: {
            color: '#64748b',
            fontSize: '1.1rem',
            fontWeight: '400',
            lineHeight: '1.6',
        },
        sidebar: {
            width: '320px',
            position: 'sticky',
            top: '90px',
            height: 'calc(100vh - 130px)',
            overflowY: 'auto',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '@media (max-width: 1024px)': {
                width: '100%',
                position: 'relative',
                top: 0,
                height: 'auto',
            },
        },
        sidebarTitle: {
            fontSize: '20px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        sidebarIcon: {
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
        },
        announcementCard: {
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
        },
        announcementCardHover: {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
            background: 'rgba(255, 255, 255, 0.95)',
        },
        announcementTitle: {
            fontSize: '15px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px',
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
            lineHeight: '1.5',
        },
        announcementDate: {
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: '500',
        },
        achievementGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '20px',
        },
        achievementCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
        },
        cardLoaded: {
            opacity: 1,
            transform: 'translateY(0)',
        },
        cardImageContainer: {
            position: 'relative',
            height: '180px',
            overflow: 'hidden',
        },
        cardImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
        },
        cardImageOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
        },
        cardContent: {
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
        },
        cardTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.3',
        },
        cardDescription: {
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
        },
        detailsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        cardDetail: {
            fontSize: '13px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(241, 245, 249, 0.8)',
            borderRadius: '10px',
            transition: 'all 0.3s ease',
        },
        cardDetailIcon: {
            width: '18px',
            height: '18px',
            marginRight: '8px',
            // color: '#667eea',
        },
        detailLabel: {
            fontWeight: '600',
            marginRight: '6px',
            color: '#475569',
        },
        detailValue: {
            color: '#64748b',
        },
        medalContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden',
        },
        medalIcon: {
            width: '22px',
            height: '22px',
            marginRight: '10px',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
        },
        medalLabel: {
            fontWeight: '700',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
        },
        emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        emptyStateIcon: {
            width: '80px',
            height: '80px',
            color: '#cbd5e1',
            marginBottom: '20px',
            opacity: '0.7',
        },
        emptyStateTitle: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#475569',
            marginBottom: '12px',
        },
        emptyStateText: {
            color: '#64748b',
            fontSize: '16px',
            textAlign: 'center',
            lineHeight: '1.6',
        },
        metaCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        metaCardOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            // background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        },
    };

    const getMedalStyle = (medal) => {
        switch (medal) {
            case 'Gold':
                return {
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#8B6914',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                };
            case 'Silver':
                return {
                    background: 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)',
                    color: '#4B5563',
                    boxShadow: '0 4px 20px rgba(156, 163, 175, 0.4)',
                };
            case 'Bronze':
                return {
                    background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
                    color: '#5D2A0A',
                    boxShadow: '0 4px 20px rgba(205, 127, 50, 0.4)',
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)',
                    color: '#64748B',
                    boxShadow: '0 4px 15px rgba(203, 213, 225, 0.3)',
                };
        }
    };

    return (
        <GuestLayout>
            <Head title="Prestasi" />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.backgroundPattern}></div>

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
                                    <div style={styles.metaCardOverlay}></div>
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
                                    <div style={styles.metaCardOverlay}></div>
                                    <h1 style={styles.headerTitle}>Prestasi Mahasiswa</h1>
                                    <p style={styles.headerSubtitle}>Memuat data prestasi...</p>
                                </div>
                            )}
                        </div>

                        {/* Achievement Grid */}
                        <div style={styles.achievementGrid}>
                            {achievements?.length > 0 ? (
                                achievements.map((achievement, index) => (
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
                                            if (img) img.style.transform = 'scale(1.1)';
                                            if (overlay) overlay.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            const img = e.currentTarget.querySelector('img');
                                            const overlay = e.currentTarget.querySelector('.card-overlay');
                                            if (img) img.style.transform = 'scale(1)';
                                            if (overlay) overlay.style.opacity = '0';
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
                                                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); height: 100%; color: #94a3b8;">
                                                                    <svg style="width: 48px; height: 48px; margin-bottom: 8px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                                                                    </svg>
                                                                    <span style="font-size: 12px; font-weight: 500;">Gambar tidak tersedia</span>
                                                                </div>
                                                            `;
                                                        }}
                                                    />
                                                    <div className="card-overlay" style={styles.cardImageOverlay}></div>
                                                </>
                                            ) : (
                                                <div
                                                    style={{
                                                        ...styles.cardImageContainer,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                                        color: '#94a3b8',
                                                    }}
                                                >
                                                    <svg
                                                        style={{ width: '48px', height: '48px', marginBottom: '8px' }}
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
                                                    <span style={{ fontSize: '12px', fontWeight: '500' }}>Tidak ada gambar</span>
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
                                                    <span style={styles.detailValue}>{achievement.achievementType?.name || 'Tidak ada jenis'}</span>
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
                                                    <span style={styles.detailLabel}>Event:</span>
                                                    <span style={styles.detailValue}>
                                                        {achievement.event_name ? `${achievement.event_name} (${formatDate(achievement.event_date)})` : 'Tidak ada event'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyState}>
                                    <svg style={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 4l-8 4m8-4l-8-4m-8 4l8-4m4 8v-4"
                                        />
                                    </svg>
                                    <h3 style={styles.emptyStateTitle}>Tidak ada prestasi</h3>
                                    <p style={styles.emptyStateText}>Belum ada data prestasi yang tersedia saat ini. Silakan periksa kembali nanti.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Sidebar */}
                    <div style={styles.sidebar}>
                        <h2 style={styles.sidebarTitle}>
                            <div style={styles.sidebarIcon}>🏆</div>
                            Pengumuman Kompetisi
                        </h2>

                        {announcementError ? (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-red-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {competitionAnnouncements.map((announcement) => (
                                    <Link
                                        key={announcement.announcement_id}
                                        href={`/announcement/${announcement.announcement_id}`}
                                        style={styles.announcementCard}
                                        onMouseEnter={(e) => {
                                            Object.assign(e.currentTarget.style, styles.announcementCardHover);
                                        }}
                                        onMouseLeave={(e) => {
                                            Object.assign(e.currentTarget.style, styles.announcementCard);
                                        }}
                                    >
                                        <h3 style={styles.announcementTitle}>{announcement.title || 'Tanpa Judul'}</h3>
                                        <p style={styles.announcementContent}>
                                            {(announcement.content || '')
                                                .replace(/<[^>]+>/g, '')
                                                .substring(0, 100) + '...'}
                                        </p>
                                        <p style={styles.announcementDate}>
                                            {formatDate(announcement.created_at)} |{' '}
                                            {announcement.category?.category_name || 'Uncategorized'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <svg style={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                                <h3 style={styles.emptyStateTitle}>Tidak ada pengumuman kompetisi</h3>
                                <p style={styles.emptyStateText}>Belum ada pengumuman terkait kompetisi saat ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}