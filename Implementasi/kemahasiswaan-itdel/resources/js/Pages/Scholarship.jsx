import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Scholarship({ scholarships = [] }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Simulasi loading data
    useEffect(() => {
        if (scholarships) {
            setIsLoading(false);
        } else {
            setError('Gagal memuat data beasiswa');
            setIsLoading(false);
        }
    }, [scholarships]);

    // Filter scholarships based on search term
    const filteredScholarships = scholarships.filter(
        (scholarship) =>
            scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scholarship.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            searchContainer: {
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
            },
            searchInput: {
                width: width <= 768 ? '100%' : '50%',
                padding: '10px 40px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '16px',
                color: '#2d3748',
                background: '#fff',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                outline: 'none',
                transition: 'border-color 0.3s',
            },
            searchIcon: {
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: '#718096',
            },
            scholarshipGrid: {
                display: 'grid',
                gridTemplateColumns: width <= 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
            },
            scholarshipCard: {
                background: 'linear-gradient(90deg, #ffffff 0%, #f9f9f9 100%)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                display: 'flex',
                flexDirection: 'column',
            },
            scholarshipCardHover: {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
            },
            scholarshipImg: {
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '10px',
            },
            scholarshipTitle: {
                fontSize: '18px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '5px',
            },
            scholarshipText: {
                fontSize: '14px',
                color: '#718096',
                marginBottom: '10px',
                lineHeight: '1.5',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
            },
            scholarshipDetail: {
                fontSize: '14px',
                color: '#718096',
                marginBottom: '5px',
            },
            buttonContainer: {
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
            },
            detailButton: {
                display: 'inline-block',
                padding: '8px 15px',
                background: 'linear-gradient(90deg, #007bff 0%, #00c4ff 100%)',
                color: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background 0.3s',
            },
            detailButtonHover: {
                background: 'linear-gradient(90deg, #0056b3 0%, #0099cc 100%)',
            },
            applyButton: {
                display: 'inline-block',
                padding: '8px 15px',
                background: 'linear-gradient(90deg, #28a745 0%, #34c759 100%)',
                color: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background 0.3s',
            },
            applyButtonHover: {
                background: 'linear-gradient(90deg, #1e7e34 0%, #28a745 100%)',
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
                marginBottom: '20px',
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
            <Head title="Daftar Beasiswa" />
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
                            {/* Header Section */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Daftar Beasiswa</h2>
                                <p style={{ fontSize: '16px', color: '#718096', marginBottom: '20px' }}>
                                    Temukan beasiswa yang sesuai untuk Anda
                                </p>
                                <div style={styles.searchContainer}>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input
                                            type="text"
                                            placeholder="Cari beasiswa atau kategori..."
                                            style={styles.searchInput}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <svg
                                            style={styles.searchIcon}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Scholarship Grid */}
                            {filteredScholarships.length > 0 ? (
                                <div style={styles.scholarshipGrid}>
                                    {filteredScholarships.map((scholarship) => (
                                        <div
                                            key={scholarship.scholarship_id}
                                            style={styles.scholarshipCard}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = styles.scholarshipCardHover.transform;
                                                e.currentTarget.style.boxShadow = styles.scholarshipCardHover.boxShadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                                            }}
                                        >
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
                                            <h3 style={styles.scholarshipTitle}>{scholarship.name || '-'}</h3>
                                            <p style={styles.scholarshipText}>
                                                {scholarship.description?.replace(/<[^>]+>/g, '') || '-'}
                                            </p>
                                            <p style={styles.scholarshipDetail}>
                                                <span style={{ fontWeight: '600' }}>Kategori:</span>{' '}
                                                {scholarship.category_name || '-'}
                                            </p>
                                            <p style={styles.scholarshipDetail}>
                                                <span style={{ fontWeight: '600' }}>Tanggal Buka:</span>{' '}
                                                {scholarship.start_date
                                                    ? new Date(scholarship.start_date).toLocaleDateString('id-ID', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </p>
                                            <p style={styles.scholarshipDetail}>
                                                <span style={{ fontWeight: '600' }}>Tanggal Tutup:</span>{' '}
                                                {scholarship.end_date
                                                    ? new Date(scholarship.end_date).toLocaleDateString('id-ID', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </p>
                                            <div style={styles.buttonContainer}>
                                                <Link
                                                    href={route('scholarships.show', scholarship.scholarship_id)}
                                                    style={styles.detailButton}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = styles.detailButtonHover.background;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(90deg, #007bff 0%, #00c4ff 100%)';
                                                    }}
                                                >
                                                    Lihat Detail
                                                </Link>
                                                {scholarship.form && scholarship.form.is_active && (
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
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
                                    <h3 style={styles.emptyStateTitle}>Tidak ada beasiswa yang tersedia</h3>
                                    <p style={styles.emptyStateText}>
                                        Belum ada beasiswa yang tersedia saat ini. Silakan cek kembali nanti.
                                    </p>
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