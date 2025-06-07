import { Head, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ScholarshipDetail() {
    const { scholarship, form, auth = {}, userRole, flash } = usePage().props;
    const isMahasiswa = userRole === 'mahasiswa';
    const isAuthenticated = !!auth?.user;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Fetch submission status for authenticated students
    useEffect(() => {
        if (isMahasiswa && form?.form_id && isAuthenticated && auth?.user?.token) {
            setIsLoading(true);
            axios
                .get(`/api/forms/submissions?form_id=${form.form_id}`, {
                    headers: {
                        Authorization: `Bearer ${auth.user.token}`,
                    },
                })
                .then((response) => {
                    const submissions = response.data.submissions || [];
                    setHasSubmitted(submissions.some((s) => s.form_id === form.form_id));
                    setIsLoading(false);
                })
                .catch((err) => {
                    setError('Gagal memuat status pengajuan');
                    setIsLoading(false);
                    console.error('Error fetching submissions:', err);
                });
        }
    }, [isMahasiswa, form?.form_id, isAuthenticated, auth?.user?.token]);

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
                maxWidth: '1500px',
                margin: '0 auto',
                padding: width <= 768 ? '16px' : '32px',
                backgroundColor: '#f9fafb',
                minHeight: 'calc(100vh - 200px)',
            },
            section: {
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: width <= 768 ? '20px' : '32px',
                marginBottom: '32px',
                transition: 'all 0.3s ease',
            },
            gridContainer: {
                display: 'grid',
                gridTemplateColumns: width <= 768 ? '1fr' : '1fr 1fr', // 2 kolom pada layar besar, 1 kolom pada layar kecil
                gap: '24px',
                alignItems: 'start',
            },
            title: {
                fontSize: width <= 768 ? '24px' : '36px',
                fontWeight: '800',
                color: '#1e40af',
                marginBottom: '24px',
                textAlign: 'center',
                textTransform: 'uppercase',
            },
            breadcrumb: {
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: width <= 768 ? '12px' : '14px',
                color: '#6b7280',
            },
            breadcrumbLink: {
                color: '#1e40af',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                '&:hover': {
                    color: '#1e3a8a',
                    textDecoration: 'underline',
                },
            },
            poster: {
                width: '100',
                height: 0,
                paddingBottom: '160.78%', // Changed to 9:16 ratio to match ScholarshipIndex
                maxHeight: width <= 768 ? '200px' : '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                backgroundColor: '#e5e7eb',
                position: 'relative',
                overflow: 'hidden',
            },
            posterImage: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100',
                height: '100',
                objectFit: 'cover',
            },
            detail: {
                fontSize: width <= 768 ? '14px' : '16px',
                color: '#1f2937',
                marginBottom: '12px',
            },
            description: {
                fontSize: width <= 768 ? '14px' : '16px',
                color: '#6b7280',
                marginBottom: '24px',
                lineHeight: '1.6',
                '& p': {
                    margin: '10px 0',
                },
                '& ul, & ol': {
                    paddingLeft: '20px',
                    margin: '10px 0',
                },
                '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                },
            },
            button: {
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
            },
            applyButton: {
                background: '#16a34a',
                color: '#ffffff',
                '&:hover': {
                    background: '#15803d',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
            },
            disabledButton: {
                background: '#d1d5db',
                color: '#6b7280',
                cursor: 'not-allowed',
            },
            backButton: {
                background: '#1e40af',
                color: '#ffffff',
                '&:hover': {
                    background: '#1e3a8a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
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
            loading: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
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
            <Navbar showBreadcrumbAndHeader={false} />
            <Head title={scholarship?.name || 'Detail Beasiswa'} />
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
                {error && (
                    <div style={{ ...styles.flash, ...styles.flashError }}>
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <div style={styles.loading}>
                        <svg
                            className="animate-spin h-8 w-8 text-blue-500"
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
                ) : (
                    <div style={styles.section}>
                        <nav style={styles.breadcrumb}>
                            <Link href="/" style={styles.breadcrumbLink}>
                                Beranda
                            </Link>
                            <span style={{ margin: '0 8px' }}>/</span>
                            <Link href="/scholarships" style={styles.breadcrumbLink}>
                                Beasiswa
                            </Link>
                            <span style={{ margin: '0 8px' }}>/</span>
                            <span>{scholarship?.name || 'Detail'}</span>
                        </nav>
                        <h2 style={styles.title}>{scholarship?.name || '-'}</h2>
                        <div style={styles.gridContainer}>
                            <div>
                                {scholarship?.poster && (
                                    <div style={styles.poster}>
                                        <img
                                            src={scholarship.poster}
                                            alt={`${scholarship.name} Poster`}
                                            style={styles.posterImage}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div
                                    style={styles.description}
                                    dangerouslySetInnerHTML={{ __html: scholarship?.description || 'Tidak ada deskripsi.' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <p style={styles.detail}>
                                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Kategori:</span>{' '}
                                        {scholarship?.category_name || '-'}
                                    </p>
                                    {/* <p style={styles.detail}>
                                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Tanggal Mulai:</span>{' '}
                                        {formatDate(scholarship?.start_date)}
                                    </p>
                                    <p style={styles.detail}>
                                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Tanggal Selesai:</span>{' '}
                                        {formatDate(scholarship?.end_date)}
                                    </p> */}
                                    {form ? (
                                        <>
                                            <p style={styles.detail}>
                                                <span style={{ fontWeight: '600', color: '#1e40af' }}>Formulir:</span>{' '}
                                                {form.form_name || '-'}
                                            </p>
                                            <p style={styles.detail}>
                                                <span style={{ fontWeight: '600', color: '#1e40af' }}>Pendaftaran:</span>{' '}
                                                {formatDate(form.open_date)}
                                            </p>
                                            <p style={styles.detail}>
                                                <span style={{ fontWeight: '600', color: '#1e40af' }}>Berakhir:</span>{' '}
                                                {formatDate(form.close_date)}
                                            </p>
                                        </>
                                    ) : (
                                        <p style={styles.detail}>
                                            <span style={{ fontWeight: '600', color: '#1e40af' }}>Formulir:</span>{' '}
                                            Tidak tersedia
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
                            {form?.is_active ? (
                                <Link
                                    href={`/scholarships/form/${form.form_id}`}
                                    style={{
                                        ...styles.button,
                                        ...(isMahasiswa && hasSubmitted && isAuthenticated
                                            ? styles.disabledButton
                                            : styles.applyButton),
                                    }}
                                >
                                    {isMahasiswa && hasSubmitted && isAuthenticated
                                        ? 'Sudah Diajukan'
                                        : 'Ajukan Beasiswa'}
                                </Link>
                            ) : (
                                <span style={{ ...styles.button, ...styles.disabledButton }}>
                                    Pendaftaran Ditutup
                                </span>
                            )}
                            <Link
                                href="/scholarships"
                                style={{ ...styles.button, ...styles.backButton }}
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}