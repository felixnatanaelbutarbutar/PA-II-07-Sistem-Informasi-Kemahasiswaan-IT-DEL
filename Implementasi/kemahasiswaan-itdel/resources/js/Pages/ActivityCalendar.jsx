import React, { useState, useMemo, useEffect } from 'react';
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

export default function ActivityCalendar({ activities }) {
    const events = useMemo(() => {
        return activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            start: new Date(activity.start_date),
            end: activity.end_date ? new Date(activity.end_date) : new Date(activity.start_date),
            description: activity.description,
            creatorRole: activity.creator?.role.toLowerCase(), // Ambil role pembuat kegiatan
        }));
    }, [activities]);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);

        const detailCard = document.querySelector('.detail-card');
        if (detailCard) {
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

            observer.observe(detailCard);

            return () => observer.disconnect();
        }
    }, [selectedEvent]);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
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
        ? `${route('activities.guest.export.pdf')}?start_date=${startDate}&end_date=${endDate}`
        : route('activities.guest.export.pdf');

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
        colorGuideWrapper: {
            marginTop: '24px',
            textAlign: 'center',
        },
        colorGuideTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e293b',
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
            transition: 'all 0.3s ease',
        },
        colorGuideItemHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        },
        colorBox: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            marginRight: '12px',
        },
        colorText: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#475569',
        },
        calendarContainer: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        buttonExport: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        buttonExportHover: {
            background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        },
        detailCard: {
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            margin: '24px auto',
            maxWidth: '1280px',
            padding: '24px',
        },
        detailCardLoaded: {
            opacity: 1,
            transform: 'translateY(0)',
        },
        detailTitle: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '16px',
        },
        detailText: {
            fontSize: '16px',
            color: '#475569',
            marginBottom: '12px',
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
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        modalTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px',
        },
        inputGroup: {
            marginBottom: '16px',
        },
        inputLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#475569',
            marginBottom: '8px',
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            color: '#1e293b',
            background: '#fff',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
        },
        buttonCancel: {
            padding: '10px 20px',
            background: '#e2e8f0',
            color: '#475569',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.3s ease',
        },
        buttonCancelHover: {
            background: '#d1d5db',
        },
        buttonExportModal: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
        },
        buttonExportModalHover: {
            background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
        },
    };

    return (
        <GuestLayout>
            <Head title="Kalender Kegiatan" />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.backgroundEffect}></div>
                <div style={styles.contentWrapper}>
                    <div style={styles.sectionHeader}>
                        {/* <h2 style={styles.sectionTitle}>
                            Kalender Kegiatan
                            <div style={styles.sectionTitleUnderline}></div>
                        </h2> */}

                        <div style={styles.colorGuideWrapper}>
                            <h3 style={styles.colorGuideTitle}>Panduan Warna Kegiatan</h3>
                            <div style={styles.colorGuideContainer}>
                                <div
                                    style={styles.colorGuideItem}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.colorGuideItemHover.transform;
                                        e.currentTarget.style.boxShadow = styles.colorGuideItemHover.boxShadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = styles.colorGuideItem.boxShadow;
                                    }}
                                >
                                    <div style={{ ...styles.colorBox, backgroundColor: '#F54243' }}></div>
                                    <span style={styles.colorText}>Kegiatan dari Kemahasiswaan</span>
                                </div>
                                <div
                                    style={styles.colorGuideItem}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.colorGuideItemHover.transform;
                                        e.currentTarget.style.boxShadow = styles.colorGuideItemHover.boxShadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = styles.colorGuideItem.boxShadow;
                                    }}
                                >
                                    <div style={{ ...styles.colorBox, backgroundColor: '#22A7F4' }}></div>
                                    <span style={styles.colorText}>Kegiatan dari Admin BEM</span>
                                </div>
                                <div
                                    style={styles.colorGuideItem}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.colorGuideItemHover.transform;
                                        e.currentTarget.style.boxShadow = styles.colorGuideItemHover.boxShadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = styles.colorGuideItem.boxShadow;
                                    }}
                                >
                                    <div style={{ ...styles.colorBox, backgroundColor: '#E7E73E' }}></div>
                                    <span style={styles.colorText}>Kegiatan dari Admin MPM</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={styles.buttonExport}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = styles.buttonExportHover.background;
                                    e.currentTarget.style.transform = styles.buttonExportHover.transform;
                                    e.currentTarget.style.boxShadow = styles.buttonExportHover.boxShadow;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = styles.buttonExport.background;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = styles.buttonExport.boxShadow;
                                }}
                            >
                                <Download style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                                Ekspor ke PDF
                            </button>
                        </div>
                        <p style={styles.sectionSubtitle}>
                            Lihat jadwal kegiatan yang telah direncanakan dalam berbagai acara
                        </p>
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

                    {selectedEvent && (
                        <div
                            className="detail-card"
                            style={{
                                ...styles.detailCard,
                                ...(isLoaded && { ...styles.detailCardLoaded }),
                            }}
                        >
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
                </div>
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}