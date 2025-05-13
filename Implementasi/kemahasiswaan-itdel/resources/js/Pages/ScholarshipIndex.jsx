import { Head, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ScholarshipIndex() {
    const { scholarships, auth, userRole, flash } = usePage().props;
    const isStudent = userRole === 'mahasiswa';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState({});

    // Fetch submission status for students
    useEffect(() => {
        if (isStudent) {
            setIsLoading(true);
            axios
                .get('/api/forms/submissions', {
                    headers: {
                        Authorization: `Bearer ${auth.user.token}`,
                    },
                })
                .then((response) => {
                    const submissions = response.data.submissions;
                    const statusMap = {};
                    submissions.forEach((submission) => {
                        statusMap[submission.form_id] = true;
                    });
                    setSubmissionStatus(statusMap);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setError('Gagal memuat status pengiriman formulir');
                    setIsLoading(false);
                    console.error(err);
                });
        }
    }, [isStudent, auth]);

    // Filter scholarships based on search term
    const filteredScholarships = scholarships.filter(
        (scholarship) =>
            scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scholarship.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Responsive styles
    const getStyles = () => {
        const width = window.innerWidth;
        return {
            container: {
                maxWidth: '1200px',
                margin: '0 auto',
                padding: width <= 768 ? '16px' : '24px',
            },
            section: {
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                padding: width <= 768 ? '16px' : '24px',
                marginBottom: '24px',
            },
            title: {
                fontSize: width <= 768 ? '24px' : '32px',
                fontWeight: '700',
                color: '#1e40af',
                marginBottom: '16px',
            },
            searchContainer: {
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
            },
            searchInput: {
                width: width <= 768 ? '100%' : '50%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            },
            grid: {
                display: 'grid',
                gridTemplateColumns: width <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
            },
            card: {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
            },
            cardHover: {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            cardTitle: {
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px',
            },
            cardText: {
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '12px',
                flexGrow: 1,
            },
            cardDetail: {
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px',
            },
            button: {
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                marginTop: '8px',
            },
            detailButton: {
                background: '#1e40af',
                color: '#ffffff',
            },
            detailButtonHover: {
                background: '#1e3a8a',
            },
            applyButton: {
                background: '#16a34a',
                color: '#ffffff',
            },
            applyButtonHover: {
                background: '#15803d',
            },
            disabledButton: {
                background: '#d1d5db',
                color: '#6b7280',
                cursor: 'not-allowed',
            },
            emptyState: {
                textAlign: 'center',
                padding: '32px',
                background: '#f9fafb',
                borderRadius: '12px',
                marginBottom: '24px',
            },
            error: {
                color: '#dc2626',
                textAlign: 'center',
                padding: '16px',
                background: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '24px',
            },
            flash: {
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'center',
            },
            flashSuccess: {
                background: '#dcfce7',
                color: '#166534',
            },
            flashError: {
                background: '#fef2f2',
                color: '#dc2626',
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
            <NavbarGuestLayoutPage />
            <Head title="Daftar Beasiswa" />
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
                {error && <div style={styles.error}>{error}</div>}
                <div style={styles.section}>
                    <h2 style={styles.title}>Daftar Beasiswa</h2>
                    <div style={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Cari beasiswa atau kategori..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <svg
                                className="animate-spin h-8 w-8 text-blue-500 mx-auto"
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
                    ) : filteredScholarships.length === 0 ? (
                        <div style={styles.emptyState}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                                Tidak ada beasiswa yang tersedia
                            </h3>
                            <p style={{ color: '#6b7280' }}>
                                Tidak ada beasiswa yang sesuai dengan pencarian Anda.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {filteredScholarships.map((scholarship) => (
                                <div
                                    key={scholarship.scholarship_id}
                                    style={styles.card}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.cardHover.transform;
                                        e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h3 style={styles.cardTitle}>{scholarship.name || '-'}</h3>
                                    <p style={styles.cardText}>
                                        {scholarship.description || 'Tidak ada deskripsi.'}
                                    </p>
                                    <p style={styles.cardDetail}>
                                        <strong>Kategori:</strong>{' '}
                                        {scholarship.category?.name || '-'}
                                    </p>
                                    {scholarship.form && (
                                        <>
                                            <p style={styles.cardDetail}>
                                                <strong>Pendaftaran:</strong>{' '}
                                                {formatDate(scholarship.form.start_date)}
                                            </p>
                                            <p style={styles.cardDetail}>
                                                <strong>Berakhir:</strong>{' '}
                                                {formatDate(scholarship.form.close_date)}
                                            </p>
                                        </>
                                    )}
                                    <Link
                                        href={
                                            isStudent
                                                ? `/student/scholarships/${scholarship.scholarship_id}`
                                                : `/scholarships/${scholarship.scholarship_id}`
                                        }
                                        style={{ ...styles.button, ...styles.detailButton }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background =
                                                styles.detailButtonHover.background;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                                styles.detailButton.background;
                                        }}
                                    >
                                        Lihat Detail
                                    </Link>
                                    {isStudent && scholarship.form?.is_active && (
                                        <Link
                                            href={`/student/forms/${scholarship.form.form_id}`}
                                            style={
                                                submissionStatus[scholarship.form.form_id]
                                                    ? { ...styles.button, ...styles.disabledButton }
                                                    : { ...styles.button, ...styles.applyButton }
                                            }
                                            onMouseEnter={(e) => {
                                                if (!submissionStatus[scholarship.form.form_id]) {
                                                    e.currentTarget.style.background =
                                                        styles.applyButtonHover.background;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!submissionStatus[scholarship.form.form_id]) {
                                                    e.currentTarget.style.background =
                                                        styles.applyButton.background;
                                                }
                                            }}
                                            onClick={(e) => {
                                                if (submissionStatus[scholarship.form.form_id]) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            {submissionStatus[scholarship.form.form_id]
                                                ? 'Sudah Diajukan'
                                                : 'Ajukan Beasiswa'}
                                        </Link>
                                    )}
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
