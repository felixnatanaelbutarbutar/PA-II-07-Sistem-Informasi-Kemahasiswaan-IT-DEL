import { Head, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';

export default function ScholarshipIndex() {
    const { scholarships, auth, userRole, flash } = usePage().props;
    const isStudent = userRole === 'mahasiswa';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [submissionStatus, setSubmissionStatus] = useState({});

    // Fetch submission status for students
    useEffect(() => {
        if (isStudent && auth.user?.token) {
            fetch('/api/forms/submissions', {
                headers: {
                    Authorization: `Bearer ${auth.user.token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    const statusMap = {};
                    (data.submissions || []).forEach((submission) => {
                        statusMap[submission.form_id] = true;
                    });
                    setSubmissionStatus(statusMap);
                })
                .catch((err) => console.error('Gagal memuat status pengiriman:', err));
        }
    }, [isStudent, auth.user?.token]);

    // Filter scholarships based on search term and category
    const filteredScholarships = scholarships.filter((scholarship) => {
        const matchesSearch =
            scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scholarship.category_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === 'Semua' ||
            scholarship.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Function to truncate description to a limited number of words
    const truncateDescription = (html, maxWords = 10) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html || 'Tidak ada deskripsi.';
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const words = text.split(/\s+/);
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(' ') + '...';
        }
        return text;
    };

    // Responsive styles
    const getStyles = () => {
        const width = window.innerWidth;
        return {
            container: {
                maxWidth: '1500px',
                margin: '0 auto',
                padding: width <= 768 ? '16px' : '32px',
                backgroundColor: '#f9fafb',
                minHeight: 'calc(100vh - 200px)',
            },
            section: {
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: width <= 768 ? '20px' : '32px',
                marginBottom: '32px',
                transition: 'all 0.3s ease',
            },
            title: {
                fontSize: width <= 768 ? '24px' : '36px',
                fontWeight: '800',
                color: '#1e40af',
                marginBottom: '24px',
                textAlign: 'center',
                textTransform: 'uppercase',
            },
            searchFilterContainer: {
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '32px',
                flexWrap: 'wrap', // Responsif untuk layar kecil
            },
            searchInput: {
                width: width <= 768 ? '100%' : '60%',
                padding: '14px 20px',
                borderRadius: '50px',
                border: '2px solid #d1d5db',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:focus': {
                    borderColor: '#1e40af',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
                },
                minWidth: '200px', // Minimum width untuk konsistensi
            },
            filterSelect: {
                padding: '14px 20px',
                borderRadius: '50px',
                border: '2px solid #d1d5db',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:focus': {
                    borderColor: '#1e40af',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
                },
                minWidth: '150px',
            },
            grid: {
                display: 'grid',
                // Ubah menjadi fixed 4 kolom per baris
                gridTemplateColumns: width <= 768 ? '1fr' : 'repeat(4, 1fr)', // 4 kolom tetap untuk layar besar
                gap: width <= 768 ? '16px' : '24px',
                padding: '16px',
            },
            card: {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                width: '100%', // Pastikan card mengambil lebar sesuai grid
                boxSizing: 'border-box', // Hindari overflow karena padding/border
            },
            cardHover: {
                transform: 'translateY(-6px)',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
                background: '#f8fafc',
            },
            cardImage: {
                width: '100%',
                height: 0,
                paddingBottom: '160.78%', // Tetap rasio 9:16
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '12px',
                transition: 'transform 0.3s ease',
                backgroundColor: '#e5e7eb',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                    transform: 'scale(1.05)',
                },
            },
            cardImageContent: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            },
            cardTitle: {
                fontSize: width <= 768 ? '16px' : '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '10px',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            },
            cardText: {
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '12px',
                flexGrow: '1',
                textAlign: 'justify',
                lineHeight: '1.5',
                maxHeight: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
            },
            cardDescription: {
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '12px',
                flexGrow: '1',
                textAlign: 'justify',
                lineHeight: '1.5',
                maxHeight: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
            },
            cardDetail: {
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '10px',
                textAlign: 'left',
            },
            button: {
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                marginTop: '10px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
            },
            detailButton: {
                background: '#1e40af',
                color: '#ffffff',
            },
            detailButtonHover: {
                background: '#1e3a8a',
                transform: 'translateY(-2px)',
            },
            applyButton: {
                background: '#16a34a',
                color: '#ffffff',
            },
            applyButtonHover: {
                background: '#15803d',
                transform: 'translateY(-2px)',
            },
            disabledButton: {
                background: '#d1d5db',
                color: '#6b7280',
                cursor: 'not-allowed',
            },
            emptyState: {
                textAlign: 'center',
                padding: '40px',
                background: '#f9fafb',
                borderRadius: '12px',
                marginBottom: '24px',
                color: '#6b7280',
            },
            error: {
                color: '#dc2626',
                textAlign: 'center',
                padding: '20px',
                background: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '24px',
                fontWeight: '500',
            },
            flash: {
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            },
            flashSuccess: {
                background: '#dcfce7',
                color: '#166534',
                borderLeft: '4px solid #166534',
            },
            flashError: {
                background: '#fef2f2',
                color: '#dc2626',
                borderLeft: '4px solid #dc2626',
            },
        };
    };

    const [styles, setStyles] = useState(getStyles());

    useEffect(() => {
        const handleResize = () => setStyles(getStyles());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <GuestLayout>
            <Navbar />
            <Head title="Beasiswa" />
            <div style={styles.container}>
                {flash?.success && (
                    <div style={{ ...styles.flash, ...styles.flashSuccess }}>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div style={{ ...styles.flash, ...styles.flashError }}>
                        {flash.error}
                    </div>
                )}
                <div style={styles.section}>
                    <div style={styles.searchFilterContainer}>
                        <input
                            type="text"
                            placeholder="Cari beasiswa atau kategori..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            style={styles.filterSelect}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="Semua">Semua Kategori</option>
                            {[...new Set(scholarships.map(scholarship => scholarship.category_id))].map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    {filteredScholarships.length === 0 ? (
                        <div style={styles.emptyState}>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                                Tidak ada beasiswa yang tersedia
                            </h3>
                            <p style={{ color: '#6b7280' }}>
                                Coba ubah kata kunci pencarian atau pilih kategori lain.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {filteredScholarships.map((scholarship) => (
                                <div
                                    key={scholarship.scholarship_id}
                                    style={styles.card}
                                    onMouseEnter={(e) => {
                                        Object.assign(e.currentTarget.style, styles.cardHover);
                                    }}
                                    onMouseLeave={(e) => {
                                        Object.assign(e.currentTarget.style, styles.card);
                                    }}
                                >
                                    {scholarship.poster && (
                                        <div style={styles.cardImage}>
                                            <img
                                                src={scholarship.poster}
                                                alt={`${scholarship.name} Poster`}
                                                style={styles.cardImageContent}
                                            />
                                        </div>
                                    )}
                                    <h3 style={styles.cardTitle}>{scholarship.name || '-'}</h3>
                                    <div
                                        style={styles.cardDescription}
                                        dangerouslySetInnerHTML={{
                                            __html: truncateDescription(scholarship.description),
                                        }}
                                    />
                                    <p style={styles.cardDetail}>
                                        <strong>Kategori:</strong> {scholarship.category_name || '-'}
                                    </p>
                                    <p style={styles.cardDetail}>
                                        <strong>Tanggal Mulai:</strong> {formatDate(scholarship.start_date)}
                                    </p>
                                    <p style={styles.cardDetail}>
                                        <strong>Tanggal Selesai:</strong> {formatDate(scholarship.end_date)}
                                    </p>
                                    <Link
                                        href={`/scholarships/${scholarship.scholarship_id}`}
                                        style={{ ...styles.button, ...styles.detailButton }}
                                        onMouseEnter={(e) => {
                                            Object.assign(e.currentTarget.style, styles.detailButtonHover);
                                        }}
                                        onMouseLeave={(e) => {
                                            Object.assign(e.currentTarget.style, styles.detailButton);
                                        }}
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}