import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { usePage } from '@inertiajs/react';

export default function ScholarshipDetail({ scholarship, form }) {
    const { url } = usePage();

    // Fungsi untuk mendapatkan judul halaman
    const getPageTitle = () => {
        return scholarship.name || 'Detail Beasiswa';
    };

    // Fungsi untuk membuat breadcrumb
    const getBreadcrumb = () => {
        const breadcrumbItems = [];

        breadcrumbItems.push(
            <Link key="beranda" href="/" className="hover:underline">
                Beranda
            </Link>,
            <span key="separator-1" className="mx-2">/</span>,
            <span key="layanan">Layanan Kemahasiswaan</span>,
            <span key="separator-2" className="mx-2">/</span>,
            <Link key="beasiswa" href="/beasiswa" className="hover:underline">
                Beasiswa
            </Link>,
            <span key="separator-3" className="mx-2">/</span>,
            <span key="detail">{scholarship.name}</span>
        );

        return breadcrumbItems;
    };

    // Format tanggal ke dalam format DD MMMM YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'Tidak Diketahui';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title={`Detail Beasiswa - ${scholarship.name}`} />

            {/* CSS Styles */}
            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Inter', Arial, sans-serif;
                        background: #f8fafc;
                    }
                    .main-container {
                        min-height: 100vh;
                        padding: 60px 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .header-section {
                        width: 100%;
                        height: 400px;
                        background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80') no-repeat center center;
                        background-size: cover;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #ffffff;
                        text-align: center;
                        position: relative;
                        margin-bottom: 40px;
                    }
                    .header-section::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                    }
                    .header-section h1 {
                        font-size: 48px;
                        font-weight: 700;
                        position: relative;
                        z-index: 1;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    .header-section p {
                        font-size: 18px;
                        position: relative;
                        z-index: 1;
                        margin-top: 10px;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    }
                    .header-section p a, .header-section p span {
                        color: #ffffff;
                        font-weight: 500;
                    }
                    .detail-section {
                        max-width: 1200px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        padding: 40px;
                        margin-bottom: 40px;
                    }
                    .detail-section h2 {
                        font-size: 32px;
                        font-weight: 700;
                        color: #1e40af;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .detail-image {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 30px;
                    }
                    .detail-image img {
                        max-width: 100%;
                        max-height: 400px;
                        border-radius: 12px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    }
                    .detail-text {
                        margin-bottom: 30px;
                    }
                    .detail-text p {
                        font-size: 16px;
                        color: #4b5563;
                        line-height: 1.6;
                        margin-bottom: 15px;
                    }
                    .detail-text .info-item {
                        margin-bottom: 15px;
                    }
                    .detail-text .info-item strong {
                        color: #1e40af;
                        display: inline-block;
                        min-width: 150px;
                    }
                    .register-button {
                        display: block;
                        margin: 0 auto 20px;
                        padding: 12px 24px;
                        background: #1e40af;
                        color: #ffffff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    .register-button:hover {
                        background: #1e3a8a;
                    }
                    .timeline {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .timeline p {
                        font-size: 16px;
                        color: #4b5563;
                        margin: 5px 0;
                    }
                    .timeline p strong {
                        color: #1e40af;
                    }
                    .back-button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 24px;
                        background: #1e40af;
                        color: #ffffff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        text-decoration: none;
                        transition: background 0.3s ease;
                    }
                    .back-button:hover {
                        background: #1e3a8a;
                    }
                    @media (max-width: 768px) {
                        .main-container {
                            padding: 40px 15px;
                        }
                        .header-section {
                            height: 300px;
                        }
                        .header-section h1 {
                            font-size: 32px;
                        }
                        .header-section p {
                            font-size: 16px;
                        }
                        .detail-section {
                            padding: 30px;
                        }
                        .detail-image img {
                            max-height: 300px;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                {/* Header Section */}
                <div className="header-section">
                    <h1>{getPageTitle()}</h1>
                    <p className="flex flex-wrap justify-center gap-1">
                        {getBreadcrumb()}
                    </p>
                </div>

                {/* Scholarship Detail Section */}
                <div className="detail-section">
                    <h2>Detail Beasiswa</h2>
                    {scholarship.poster && (
                        <div className="detail-image">
                            <img src={scholarship.poster} alt={scholarship.name} />
                        </div>
                    )}
                    <div className="detail-text">
                        <div className="info-item">
                            <strong>Nama Beasiswa:</strong> {scholarship.name}
                        </div>
                        <div className="info-item">
                            <strong>Kategori:</strong> {scholarship.category?.category_name || 'Tidak Berkategori'}
                        </div>
                        <div className="info-item">
                            <strong>Deskripsi:</strong>
                            <p>{scholarship.description}</p>
                        </div>
                    </div>
                    <button
                        className="register-button"
                        onClick={() => router.visit(`/beasiswa/${form.form_id}/form`)}
                        disabled={!form}
                    >
                        Daftar Sekarang
                    </button>
                    {form && (
                        <div className="timeline">
                            <p>
                                <strong>Tanggal Buka:</strong> {formatDate(form.open_date)}
                            </p>
                            <p>
                                <strong>Tanggal Tutup:</strong> {form.close_date ? formatDate(form.close_date) : 'Belum Ditentukan'}
                            </p>
                        </div>
                    )}
                </div>

                <Link href="/beasiswa" className="back-button">
                    Kembali ke Daftar Beasiswa
                </Link>
            </div>

            <FooterLayout />
        </GuestLayout>
    );
}
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ScholarshipDetail({ scholarship }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulasi loading data
    useEffect(() => {
        if (scholarship) {
            setIsLoading(false);
        } else {
            setError('Gagal memuat detail beasiswa');
            setIsLoading(false);
        }
    }, [scholarship]);

    // Fungsi untuk mendapatkan style responsif
    const getResponsiveStyles = () => {
        const width = window.innerWidth;
        return {
            body: {
                fontFamily: "'Inter', sans-serif",
                margin: 0,
                padding: 0,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
            },
            container: {
                maxWidth: '1200px',
                margin: '0 auto',
                padding: width <= 768 ? '10px' : '20px',
            },
            section: {
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                padding: width <= 768 ? '15px' : '20px',
                marginBottom: '20px',
                backdropFilter: 'blur(10px)',
            },
            sectionTitle: {
                fontSize: width <= 768 ? '20px' : '24px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '15px',
                borderBottom: '2px solid #007bff',
                paddingBottom: '5px',
            },
            headerContainer: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
            },
            backButton: {
                display: 'inline-block',
                padding: '8px 15px',
                background: '#e0e0e0',
                color: '#2d3748',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background 0.3s',
            },
            backButtonHover: {
                background: '#d0d0d0',
            },
            scholarshipImg: {
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '8px',
                margin: '0 auto 20px',
                display: 'block',
            },
            infoGrid: {
                display: 'grid',
                gridTemplateColumns: width <= 768 ? '1fr' : '1fr auto',
                gap: '20px',
                marginBottom: '20px',
            },
            infoText: {
                fontSize: '14px',
                color: '#718096',
                marginBottom: '10px',
            },
            applyButton: {
                display: 'inline-block',
                padding: '10px 20px',
                background: 'linear-gradient(90deg, #28a745 0%, #34c759 100%)',
                color: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background 0.3s',
            },
            applyButtonHover: {
                background: 'linear-gradient(90deg, #1e7e34 0%, #28a745 100%)',
            },
            unavailableText: {
                fontSize: '14px',
                color: '#718096',
                fontStyle: 'italic',
            },
            descriptionSection: {
                padding: '15px',
                background: '#f9f9f9',
                borderRadius: '8px',
                marginTop: '20px',
            },
            descriptionTitle: {
                fontSize: '18px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '10px',
            },
            descriptionContent: {
                fontSize: '14px',
                color: '#718096',
                lineHeight: '1.6',
            },
            emptyState: {
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
            },
            emptyStateTitle: {
                fontSize: '20px',
                fontWeight: '500',
                color: '#4a4a4a',
                marginBottom: '10px',
            },
            emptyStateText: {
                color: '#718096',
                fontSize: '16px',
            },
            loadingState: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
            },
            errorMessage: {
                textAlign: 'center',
                color: '#e53e3e',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                marginpptBottom: '20px',
            },
        };
    };

    // State untuk menyimpan styles responsif
    const [styles, setStyles] = useState(getResponsiveStyles());

    // Update styles saat ukuran layar berubah
    useEffect(() => {
        const handleResize = () => {
            setStyles(getResponsiveStyles());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title={scholarship?.name || 'Detail Beasiswa'} />
            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div style={styles.loadingState}>
                            <svg
                                className="animate-spin h-10 w-10 text-blue-500"
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
                        <>
                            {scholarship ? (
                                <div style={styles.section}>
                                    <div style={styles.headerContainer}>
                                        <h2 style={styles.sectionTitle}>
                                            {scholarship.name || '-'}
                                        </h2>
                                        <Link
                                            href={route('scholarships.guest.index')}
                                            style={styles.backButton}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = styles.backButtonHover.background;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#e0e0e0';
                                            }}
                                        >
                                            Kembali
                                        </Link>
                                    </div>

                                    {/* Poster */}
                                    {scholarship.poster ? (
                                        <img
                                            src={scholarship.poster}
                                            alt={scholarship.name}
                                            style={styles.scholarshipImg}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                ...styles.scholarshipImg,
                                                maxWidth: '500px',
                                                background: '#e0e0e0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#718096',
                                            }}
                                        >
                                            Tidak ada poster
                                        </div>
                                    )}

                                    {/* Scholarship Info */}
                                    <div style={styles.infoGrid}>
                                        <div>
                                            <p style={styles.infoText}>
                                                <span style={{ fontWeight: '600' }}>Kategori:</span>{' '}
                                                {scholarship.category_name || '-'}
                                            </p>
                                            <p style={styles.infoText}>
                                                <span style={{ fontWeight: '600' }}>Tanggal Buka:</span>{' '}
                                                {scholarship.start_date
                                                    ? new Date(scholarship.start_date).toLocaleDateString('id-ID', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </p>
                                            <p style={styles.infoText}>
                                                <span style={{ fontWeight: '600' }}>Tanggal Tutup:</span>{' '}
                                                {scholarship.end_date
                                                    ? new Date(scholarship.end_date).toLocaleDateString('id-ID', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </p>
                                            <p style={styles.infoText}>
                                                <span style={{ fontWeight: '600' }}>Dibuat Oleh:</span>{' '}
                                                {scholarship.created_by || '-'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end' }}>
                                            {scholarship.form && scholarship.form.is_active ? (
                                                <Link
                                                    href={`/form/${scholarship.form.form_id}/apply`} // Adjust this URL based on your form application route
                                                    style={styles.applyButton}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = styles.applyButtonHover.background;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(90deg, #28a745 0%, #34c759 100%)';
                                                    }}
                                                >
                                                    Ajukan Beasiswa
                                                </Link>
                                            ) : (
                                                <p style={styles.unavailableText}>Pendaftaran belum tersedia.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div style={styles.descriptionSection}>
                                        <h3 style={styles.descriptionTitle}>Deskripsi Beasiswa</h3>
                                        <div
                                            style={styles.descriptionContent}
                                            dangerouslySetInnerHTML={{ __html: scholarship.description || '-' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.emptyState}>
                                    <svg
                                        className="w-16 h-16 text-gray-400 mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <h3 style={styles.emptyStateTitle}>Tidak ada data beasiswa</h3>
                                    <p style={styles.emptyStateText}>Detail beasiswa tidak ditemukan.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}
