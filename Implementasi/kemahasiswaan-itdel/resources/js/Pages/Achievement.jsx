import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Achievement({ achievements }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Animasi fade-in saat komponen dimuat
        setIsLoaded(true);

        // Efek animasi untuk kartu prestasi
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

        return () => observer.disconnect();
    }, []);

    // Format date helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Enhanced styles dengan efek visual yang lebih menarik
    const styles = {
        container: {
            padding: '60px 0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
        },
        backgroundEffect: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
            zIndex: 0,
        },
        contentWrapper: {
            position: 'relative',
            zIndex: 1,
        },
        sectionHeader: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            marginBottom: '50px',
        },
        sectionTitle: {
            fontSize: '36px',
            fontWeight: '800',
            color: '#1e293b',
            textAlign: 'center',
            position: 'relative',
            display: 'inline-block',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0 20px',
        },
        sectionTitleUnderline: {
            content: '""',
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: '2px',
        },
        sectionSubtitle: {
            fontSize: '18px',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '16px auto 0',
        },
        achievementGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
        },
        achievementCard: {
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            opacity: 0,
            transform: 'translateY(20px)',
        },
        cardLoaded: {
            opacity: 1,
            transform: 'translateY(0)',
        },
        cardHover: {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
        },
        cardHeader: {
            padding: '16px 24px',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            position: 'relative',
        },
        cardHeaderAccent: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(to bottom, #3b82f6, #60a5fa)',
        },
        cardContent: {
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
        },
        cardTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.3',
        },
        cardDescription: {
            fontSize: '15px',
            color: '#475569',
            marginBottom: '20px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
        },
        detailsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '8px',
        },
        cardDetail: {
            fontSize: '14px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            background: 'rgba(241, 245, 249, 0.7)',
            borderRadius: '6px',
            transitionDuration: '0.2s',
        },
        cardDetailHover: {
            background: 'rgba(226, 232, 240, 0.9)',
        },
        cardDetailIcon: {
            width: '18px',
            height: '18px',
            marginRight: '8px',
            color: '#3b82f6',
        },
        detailLabel: {
            fontWeight: '500',
            marginRight: '4px',
            color: '#475569',
        },
        detailValue: {
            color: '#64748b',
        },
        medalContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            background: 'rgba(241, 245, 249, 0.7)',
            borderRadius: '6px',
            marginBottom: '12px',
        },
        medalIcon: {
            width: '22px',
            height: '22px',
            marginRight: '8px',
            filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))',
        },
        medalLabel: {
            fontWeight: '600',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 48px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        emptyStateIcon: {
            width: '80px',
            height: '80px',
            color: '#94a3b8',
            marginBottom: '24px',
            opacity: '0.8',
        },
        emptyStateTitle: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '8px',
        },
        emptyStateText: {
            color: '#64748b',
            fontSize: '16px',
        },
    };

    // Fungsi untuk mendapatkan warna dan gaya medali
    const getMedalStyle = (medal) => {
        switch (medal) {
            case 'Gold':
                return {
                    background: 'linear-gradient(45deg, #FFD700, #FFC800)',
                    color: '#85710D',
                    boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
                };
            case 'Silver':
                return {
                    background: 'linear-gradient(45deg, #E0E0E0, #C0C0C0)',
                    color: '#5F5F5F',
                    boxShadow: '0 2px 10px rgba(192, 192, 192, 0.3)',
                };
            case 'Bronze':
                return {
                    background: 'linear-gradient(45deg, #CD7F32, #BE7023)',
                    color: '#6E4619',
                    boxShadow: '0 2px 10px rgba(205, 127, 50, 0.3)',
                };
            default:
                return {
                    background: 'linear-gradient(45deg, #E2E8F0, #CBD5E1)',
                    color: '#475569',
                    boxShadow: 'none',
                };
        }
    };

    return (
        <GuestLayout>
            <Head title="Prestasi" />
            <NavbarGuestLayout />

            {/* Achievements Section */}
            <div style={styles.container}>
                <div style={styles.backgroundEffect}></div>
                <div style={styles.contentWrapper}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            Daftar Prestasi
                            <div style={styles.sectionTitleUnderline}></div>
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Berbagai pencapaian dan prestasi yang telah diraih dalam berbagai bidang dan kompetisi
                        </p>
                    </div>

                    <div style={styles.achievementGrid}>
                        {achievements.length > 0 ? (
                            achievements.map((achievement, index) => (
                                <div
                                    key={achievement.achievement_id}
                                    className="achievement-card"
                                    style={{
                                        ...styles.achievementCard,
                                        ...(isLoaded && { ...styles.cardLoaded }),
                                        transitionDelay: `${index * 0.1}s`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.cardHover.transform;
                                        e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = styles.cardLoaded.transform;
                                        e.currentTarget.style.boxShadow = styles.achievementCard.boxShadow;
                                    }}
                                >
                                    <div style={styles.cardHeader}>
                                        <div style={styles.cardHeaderAccent}></div>
                                        <h3 style={styles.cardTitle}>{achievement.title}</h3>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <p style={styles.cardDescription}>{achievement.description}</p>

                                        {/* Medali (jika ada) */}
                                        {achievement.medal && (
                                            <div 
                                                style={{
                                                    ...styles.medalContainer,
                                                    ...getMedalStyle(achievement.medal)
                                                }}
                                            >
                                                <svg
                                                    style={styles.medalIcon}
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M12 2a9 9 0 106.3 15.4l3.9 3.9a1 1 0 001.4-1.4l-3.9-3.9A9 9 0 0012 2zm0 16a7 7 0 110-14 7 7 0 010 14z"
                                                    />
                                                    <path
                                                        d="M12 7a3 3 0 100 6 3 3 0 000-6z"
                                                    />
                                                </svg>
                                                <span style={styles.medalLabel}>{achievement.medal}</span>
                                            </div>
                                        )}

                                        <div style={styles.detailsContainer}>
                                            {/* Kategori */}
                                            <div 
                                                style={styles.cardDetail}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = styles.cardDetailHover.background;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = styles.cardDetail.background;
                                                }}
                                            >
                                                <svg
                                                    style={styles.cardDetailIcon}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                    />
                                                </svg>
                                                <span style={styles.detailLabel}>Kategori:</span>
                                                <span style={styles.detailValue}>{achievement.category}</span>
                                            </div>

                                            {/* Jenis Prestasi */}
                                            <div 
                                                style={styles.cardDetail}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = styles.cardDetailHover.background;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = styles.cardDetail.background;
                                                }}  
                                            >
                                                <svg
                                                    style={styles.cardDetailIcon}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
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

                                            {/* Event dan Tanggal */}
                                            <div 
                                                style={styles.cardDetail}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = styles.cardDetailHover.background;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = styles.cardDetail.background;
                                                }}
                                            >
                                                <svg
                                                    style={styles.cardDetailIcon}
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
                                                <span style={styles.detailLabel}>Event:</span>
                                                <span style={styles.detailValue}>{achievement.event_name} ({formatDate(achievement.event_date)})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                        d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 4l-8 4m8-4l-8-4m-8 4l8-4m4 8v-4"
                                    />
                                </svg>
                                <h3 style={styles.emptyStateTitle}>Tidak ada prestasi</h3>
                                <p style={styles.emptyStateText}>Belum ada data prestasi yang tersedia saat ini. Silakan periksa kembali nanti.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chatbot Widget */}
            <ChatbotWidget />

            <FooterLayout />
        </GuestLayout>
    );
}