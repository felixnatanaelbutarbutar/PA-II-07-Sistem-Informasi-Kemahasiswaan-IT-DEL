import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Achievement({ achievements }) {
    const [isLoaded, setIsLoaded] = useState(false);

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

        return () => observer.disconnect();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const styles = {
        container: {
            padding: '48px 0',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
        },
        sectionHeader: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            marginBottom: '24px',
        },
        sectionSubtitle: {
            fontSize: '15px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
        },
        achievementGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
        },
        achievementCard: {
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        },
        cardLoaded: {
            opacity: 1,
            transform: 'translateY(0)',
        },
        cardContent: {
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
        },
        cardTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.3',
        },
        cardDescription: {
            fontSize: '13px',
            color: '#4b5563',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
        },
        detailsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        cardDetail: {
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            background: 'rgba(241, 245, 249, 0.7)',
            borderRadius: '4px',
        },
        cardDetailIcon: {
            width: '16px',
            height: '16px',
            marginRight: '6px',
            color: '#2563eb',
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
            padding: '4px 8px',
            background: 'rgba(241, 245, 249, 0.7)',
            borderRadius: '4px',
            marginBottom: '8px',
        },
        medalIcon: {
            width: '18px',
            height: '18px',
            marginRight: '6px',
            filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))',
        },
        medalLabel: {
            fontWeight: '600',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 32px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        emptyStateIcon: {
            width: '64px',
            height: '64px',
            color: '#94a3b8',
            marginBottom: '16px',
            opacity: '0.8',
        },
        emptyStateTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '8px',
        },
        emptyStateText: {
            color: '#64748b',
            fontSize: '14px',
            textAlign: 'center',
        },
    };

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
            <Navbar />

            <div style={styles.container}>
                <div style={styles.sectionHeader}>
                    <p style={styles.sectionSubtitle}>
                        Kumpulan prestasi membanggakan yang telah diraih oleh mahasiswa dalam berbagai kompetisi dan bidang.
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
                                    transitionDelay: `${index * 0.1}s`,
                                }}
                            >
                                <div style={styles.cardContent}>
                                    <h3 style={styles.cardTitle}>{achievement.title}</h3>
                                    <p style={styles.cardDescription}>{achievement.description}</p>

                                    {achievement.medal && (
                                        <div style={{ ...styles.medalContainer, ...getMedalStyle(achievement.medal) }}>
                                            <svg
                                                style={styles.medalIcon}
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M12 2a9 9 0 106.3 15.4l3.9 3.9a1 1 0 001.4-1.4l-3.9-3.9A9 9 0 0012 2zm0 16a7 7 0 110-14 7 7 0 010 14z" />
                                                <path d="M12 7a3 3 0 100 6 3 3 0 000-6z" />
                                            </svg>
                                            <span style={styles.medalLabel}>{achievement.medal}</span>
                                        </div>
                                    )}

                                    <div style={styles.detailsContainer}>
                                        <div style={styles.cardDetail}>
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

                                        <div style={styles.cardDetail}>
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

                                        <div style={styles.cardDetail}>
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

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}