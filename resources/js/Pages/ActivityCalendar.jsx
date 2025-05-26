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

const localizer = momentLocalizer(moment);

export default function ActivityCalendar() {
    const [activities, setActivities] = useState([]);
    const [activeActivities, setActiveActivities] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [error, setError] = useState(null);
    const detailCardRef = useRef(null);

    // Fetch data from API
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/activities');
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
                const response = await fetch('http://localhost:8000/api/activities/active');
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
        ? `http://localhost:8000/activities/guest-export-pdf?start_date=${startDate}&end_date=${endDate}`
        : 'http://localhost:8000/activities/guest-export-pdf';

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = '#F54243'; // Kemahasiswaan
        if (event.creatorRole === 'adminbem') backgroundColor = '#22A7F4'; // Admin BEM
        if (event.creatorRole === 'adminmpm') backgroundColor = '#E7E73E'; // Admin MPM
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
                return '#22A7F4'; // Admin BEM
            case 'adminmpm':
                return '#E7E73E'; // Admin MPM
            default:
                return '#F54243'; // Kemahasiswaan
        }
    };

    const styles = {
        container: {
            padding: '48px 0',
            background: '#fffff',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
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
        colorGuideWrapper: {
            marginTop: '24px',
            textAlign: 'center',
        },
        colorGuideTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
        },
        colorGuideContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
        },
        colorGuideItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        colorBox: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            marginRight: '12px',
        },
        colorText: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563',
        },
        calendarContainer: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        activeActivitiesContainer: {
            maxWidth: '1280px',
            margin: '24px auto',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        activeActivitiesTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
        },
        activeActivityItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            marginBottom: '16px',
        },
        activeActivityColorIndicator: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            marginRight: '16px',
        },
        activeActivityContent: {
            flex: 1,
        },
        activeActivityTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px',
        },
        activeActivityText: {
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '4px',
        },
        noActivitiesMessage: {
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            textAlign: 'center',
            fontSize: '14px',
            color: '#4b5563',
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
        },
        buttonExportHover: {
            background: '#1d4ed8',
        },
        detailCard: {
            maxWidth: '1280px',
            margin: '24px auto',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            opacity: isDetailVisible ? 1 : 0,
            transform: isDetailVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        },
        detailTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
        },
        detailText: {
            fontSize: '15px',
            color: '#4b5563',
            marginBottom: '8px',
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
        },
        modalContent: {
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        modalTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
        },
        inputGroup: {
            marginBottom: '16px',
        },
        inputLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563',
            marginBottom: '8px',
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            color: '#1f2937',
            background: '#fff',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
        },
        buttonCancel: {
            padding: '10px 20px',
            background: '#e5e7eb',
            color: '#374151',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background 0.3s',
        },
        buttonCancelHover: {
            background: '#d1d5db',
        },
        buttonExportModal: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background 0.3s',
        },
        buttonExportModalHover: {
            background: '#1d4ed8',
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
                    <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
                        {error}
                    </div>
                )}

                <div style={styles.sectionHeader}>
                    <div style={styles.colorGuideWrapper}>
                        <h3 style={styles.colorGuideTitle}>Panduan Warna Kegiatan</h3>
                        <div style={styles.colorGuideContainer}>
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
                </div>

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
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Tanggal Selesai</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.buttonContainer}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={styles.buttonCancel}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = styles.buttonCancelHover.background;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = styles.buttonCancel.background;
                                    }}
                                >
                                    Batal
                                </button>
                                <a
                                    href={exportUrl}
                                    onClick={handleExportPDF}
                                    style={styles.buttonExportModal}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = styles.buttonExportModalHover.background;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = styles.buttonExportModal.background;
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

                <div style={styles.calendarContainer}>
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
                                            Deskripsi: {activity.description || 'Tidak ada deskripsi.'}
                                        </p>
                                        <p style={styles.activeActivityText}>
                                            Tanggal Mulai: {formatDate(activity.start_date)}
                                        </p>
                                        <p style={styles.activeActivityText}>
                                            Tanggal Selesai: {activity.end_date ? formatDate(activity.end_date) : 'Belum ditentukan'}
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

                {selectedEvent && (
                    <div ref={detailCardRef} style={styles.detailCard}>
                        <h3 style={styles.detailTitle}>{selectedEvent.title}</h3>
                        <p style={styles.detailText}>
                            Deskripsi: {selectedEvent.description || 'Tidak ada deskripsi.'}
                        </p>
                        <p style={styles.detailText}>
                            Tanggal Mulai: {formatDate(selectedEvent.start)}
                        </p>
                        <p style={styles.detailText}>
                            Tanggal Selesai: {selectedEvent.end ? formatDate(selectedEvent.end) : 'Sama dengan tanggal mulai'}
                        </p>
                    </div>
                )}

                <div style={styles.exportWrapper}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={styles.buttonExport}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = styles.buttonExportHover.background;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = styles.buttonExport.background;
                        }}
                    >
                        <Download style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                        Ekspor ke PDF
                    </button>
                </div>
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}