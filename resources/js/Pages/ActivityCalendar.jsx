import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Download } from 'lucide-react';
import DOMPurify from 'dompurify';

const localizer = momentLocalizer(moment);

export default function ActivityCalendar({ metaDescription: initialMetaDescription = '<p>Kalender kegiatan menampilkan semua acara dan kegiatan mahasiswa yang terorganisir.</p>' }) {
    const [activities, setActivities] = useState([]);
    const [activeActivities, setActiveActivities] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [error, setError] = useState(null);
    const [metaDescription, setMetaDescription] = useState(initialMetaDescription);
    const detailCardRef = useRef(null);

    // Fetch meta description and activities (unchanged)
    useEffect(() => {
        const fetchMetaDescription = async () => {
            try {
                const response = await fetch('https://kemahasiswaanitdel.site/api/meta/kalender-kegiatan');
                if (!response.ok) throw new Error('Gagal mengambil data meta');
                const data = await response.json();
                const sanitizedDescription = DOMPurify.sanitize(data.meta_description || initialMetaDescription);
                setMetaDescription(sanitizedDescription || initialMetaDescription);
                console.log('Meta description fetched:', sanitizedDescription);
            } catch (err) {
                console.error('Error fetching meta description:', err);
                setError('Gagal memuat deskripsi kalender. Silakan coba lagi nanti.');
                setMetaDescription(initialMetaDescription);
            }
        };

        fetchMetaDescription();
    }, []);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch('https://kemahasiswaanitdel.site/api/activities');
                if (!response.ok) throw new Error('Gagal mengambil data kegiatan');
                const data = await response.json();
                setActivities(data.data || []);
            } catch (err) {
                console.error('Error fetching activities:', err);
                setError('Gagal memuat kegiatan. Silakan coba lagi nanti.');
            }
        };

        const fetchActiveActivities = async () => {
            try {
                const response = await fetch('https://kemahasiswaanitdel.site/api/activities/active');
                if (!response.ok) throw new Error('Gagal mengambil data kegiatan aktif');
                const data = await response.json();
                setActiveActivities(data);
            } catch (err) {
                console.error('Error fetching active activities:', err);
                setError('Gagal memuat kegiatan aktif. Silakan coba lagi nanti.');
            }
        };

        fetchActivities();
        fetchActiveActivities();
    }, []);

    const events = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        start: new Date(activity.start_date),
        end: activity.end_date ? new Date(activity.end_date) : new Date(activity.start_date),
        description: activity.description,
        creatorRole: activity.creator?.role.toLowerCase(),
    }));

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    setIsDetailVisible(true);
                    observer.unobserve(detailCardRef.current);
                }
            },
            { threshold: 0.2 }
        );

        if (detailCardRef.current) {
            observer.observe(detailCardRef.current);
        }

        return () => {
            if (detailCardRef.current) {
                observer.unobserve(detailCardRef.current);
            }
        };
    }, [selectedEvent]);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setIsDetailVisible(false);
    };

    const handleExportPDF = () => {
        if (!startDate || !endDate) {
            alert('Harap pilih rentang tanggal terlebih dahulu!');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Tanggal mulai harus lebih awal dari tanggal selesai!');
            return;
        }
        setIsModalOpen(false);
    };

    const exportUrl = startDate && endDate 
        ? `/activities/export/pdf?start_date=${startDate}&end_date=${endDate}`
        : 'https://kemahasiswaanitdel.site/activities/export/pdf';

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = '#F54243';
        if (event.creatorRole === 'adminbem') backgroundColor = '#22A7F4';
        if (event.creatorRole === 'adminmpm') backgroundColor = '#E7E73E';
        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'black',
                border: 'none',
                display: 'block',
            },
        };
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'adminbem':
                return '#22A7F4';
            case 'adminmpm':
                return '#E7E73E';
            default:
                return '#F54243';
        }
    };

    const styles = {
        container: {
            padding: '48px 0',
            background: '#f5f7fa',
            minHeight: '100vh',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        descriptionContainer: {
            maxWidth: '1400px', // Increased width
            margin: '0 auto 40px auto',
            padding: '32px 16px', // Reduced side padding
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease-in-out',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        descriptionTitle: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '20px',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        descriptionText: {
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.75',
            fontWeight: '400',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        mainContentWrapper: {
            maxWidth: '1400px', // Increased width
            margin: '0 auto',
            padding: '0 8px', // Reduced side padding
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            alignItems: 'start',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
            '@media (max-width: 1024px)': {
                gridTemplateColumns: '1fr',
                gap: '24px',
            },
        },
        calendarSection: {
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        calendarContainer: {
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        calendarHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        calendarTitle: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        sidebarSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        exportContainer: {
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        exportTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        buttonExport: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '15px',
            textDecoration: 'none',
            transition: 'background 0.3s',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        colorGuideContainer: {
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        colorGuideTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        colorGuideItems: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        colorGuideItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            background: 'rgba(248, 250, 252, 0.5)',
            borderRadius: '8px',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        colorBox: {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            marginRight: '12px',
            flexShrink: 0,
        },
        colorText: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        activeActivitiesContainer: {
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
            maxHeight: '600px', // Limit height to match calendar
            overflowY: 'auto', // Enable scrolling if content overflows
        },
        activeActivitiesTitle: {
            fontSize: '18px', // Slightly smaller to fit sidebar
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        activeActivityItem: {
            display: 'flex',
            alignItems: 'flex-start',
            padding: '16px',
            background: 'rgba(248, 250, 252, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            marginBottom: '12px',
            transition: 'all 0.3s ease',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        activeActivityColorIndicator: {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            marginRight: '12px',
            marginTop: '2px',
            flexShrink: 0,
        },
        activeActivityContent: {
            flex: 1,
        },
        activeActivityTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '6px',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        activeActivityText: {
            fontSize: '13px',
            color: '#4b5563',
            marginBottom: '4px',
            lineHeight: '1.5',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        noActivitiesMessage: {
            padding: '20px',
            background: 'rgba(248, 250, 252, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        detailCard: {
            maxWidth: '1400px', // Increased width
            margin: '32px auto 0 auto',
            padding: '24px 16px', // Reduced side padding
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            opacity: isDetailVisible ? 1 : 0,
            transform: isDetailVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        detailTitle: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        detailContent: {
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
        },
        detailText: {
            fontSize: '16px',
            color: '#4b5563',
            marginBottom: '12px',
            lineHeight: '1.6',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        modalContent: {
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        modalTitle: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px',
            textAlign: 'center',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        inputGroup: {
            marginBottom: '20px',
        },
        inputLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            color: '#1f2937',
            background: '#fff',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '24px',
        },
        buttonCancel: {
            padding: '12px 24px',
            background: '#e5e7eb',
            color: '#374151',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background 0.3s',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        buttonExportModal: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background 0.3s',
            textDecoration: 'none',
            fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        },
        exportWrapper: {
            maxWidth: '1280px',
            margin: '24px auto',
            padding: '0 16px',
            textAlign: 'center',
        },
    };

    return (
        <GuestLayout>
            <Head title="Kalender Kegiatan" />
            <Navbar />

            <div style={styles.container}>
                {error && (
                    <div style={{ textAlign: 'center', color: '#dc2626', padding: '20px', fontWeight: '500', fontFamily: "'Figtree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif" }}>
                        {error}
                    </div>
                )}

                {/* Tentang Kalender Kegiatan - Top Section */}
                <div style={styles.descriptionContainer}>
                    <h1 style={styles.descriptionTitle}>Tentang Kalender Kegiatan</h1>
                    <div style={styles.descriptionText} dangerouslySetInnerHTML={{ __html: metaDescription }} />
                </div>

                {/* Main Content - Calendar and Sidebar */}
                <div style={styles.mainContentWrapper}>
                    {/* Calendar Section */}
                    <div style={styles.calendarSection}>
                        <div style={styles.calendarContainer}>
                            <div style={styles.calendarHeader}>
                                <h2 style={styles.calendarTitle}>Kalender Kegiatan</h2>
                            </div>
                            <BigCalendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 600 }}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                className="rbc-calendar-custom"
                            />
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div style={styles.sidebarSection}>
                        {/* Export PDF Section */}
                        <div style={styles.exportContainer}>
                            <h3 style={styles.exportTitle}>Ekspor Kalender</h3>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={styles.buttonExport}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#1d4ed8';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#2563eb';
                                }}
                            >
                                <Download style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                                Ekspor ke PDF
                            </button>
                        </div>

                        {/* Color Guide Section */}
                        <div style={styles.colorGuideContainer}>
                            <h3 style={styles.colorGuideTitle}>Panduan Warna Kegiatan</h3>
                            <div style={styles.colorGuideItems}>
                                <div style={styles.colorGuideItem}>
                                    <div style={{ ...styles.colorBox, backgroundColor: '#F54243' }}></div>
                                    <span style={styles.colorText}>Kegiatan dari Kemahasiswaan</span>
                                </div>
                                <div style={styles.colorGuideItem}>
                                    <div style={{ ...styles.colorBox, backgroundColor: '#22A7F4' }}></div>
                                    <span style={styles.colorText}>Kegiatan dari Admin BEM</span>
                                </div>
                                <div style={styles.colorGuideItem}>
                                    <div style={{ ...styles.colorBox, backgroundColor: '#E7E73E' }}></div>
                                    <span style={styles.colorText}>Kegiatan dari Admin MPM</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Activities Section */}
                        <div style={styles.activeActivitiesContainer}>
                            <h3 style={styles.activeActivitiesTitle}>Daftar Kegiatan Aktif</h3>
                            {activeActivities.length > 0 ? (
                                <div>
                                    {activeActivities.map(activity => (
                                        <div key={activity.id} style={styles.activeActivityItem}>
                                            <div
                                                style={{
                                                    ...styles.activeActivityColorIndicator,
                                                    backgroundColor: getRoleColor(activity.creator?.role),
                                                }}
                                            />
                                            <div style={styles.activeActivityContent}>
                                                <h4 style={styles.activeActivityTitle}>{activity.title}</h4>
                                                <p style={styles.activeActivityText}>
                                                    <strong>Deskripsi:</strong> {activity.description || 'Tidak ada deskripsi.'}
                                                </p>
                                                <p style={styles.activeActivityText}>
                                                    <strong>Tanggal Mulai:</strong> {formatDate(activity.start_date)}
                                                </p>
                                                <p style={styles.activeActivityText}>
                                                    <strong>Tanggal Selesai:</strong> {activity.end_date ? formatDate(activity.end_date) : 'Belum ditentukan'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={styles.noActivitiesMessage}>
                                    Tidak ada kegiatan aktif saat ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Event Detail Card */}
                {selectedEvent && (
                    <div ref={detailCardRef} style={styles.detailCard}>
                        <h3 style={styles.detailTitle}>Detail Kegiatan: {selectedEvent.title}</h3>
                        <div style={styles.detailContent}>
                            <p style={styles.detailText}>
                                <strong>Deskripsi:</strong> {selectedEvent.description || 'Tidak ada deskripsi.'}
                            </p>
                            <p style={styles.detailText}>
                                <strong>Tanggal Mulai:</strong> {formatDate(selectedEvent.start)}
                            </p>
                            <p style={styles.detailText}>
                                <strong>Tanggal Selesai:</strong> {selectedEvent.end ? formatDate(selectedEvent.end) : 'Sama dengan tanggal mulai'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Export Modal */}
                {isModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalContent}>
                            <h2 style={styles.modalTitle}>Pilih Rentang Tanggal</h2>
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#2563eb';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Tanggal Selesai</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#2563eb';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div style={styles.buttonContainer}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={styles.buttonCancel}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#d1d5db';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#e5e7eb';
                                    }}
                                >
                                    Batal
                                </button>
                                <a
                                    href={exportUrl}
                                    onClick={handleExportPDF}
                                    style={styles.buttonExportModal}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#1d4ed8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#2563eb';
                                    }}
                                    download
                                >
                                    <Download style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                                    Ekspor
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}