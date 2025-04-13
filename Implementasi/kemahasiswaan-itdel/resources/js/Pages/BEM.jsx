import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function BEM({ bem }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDepartments, setExpandedDepartments] = useState({});

    // Simulasi loading data (jika data diambil dari API)
    useEffect(() => {
        if (bem) {
            setIsLoading(false);
        } else {
            setError('Gagal memuat data BEM');
            setIsLoading(false);
        }
    }, [bem]);

    // Fungsi untuk toggle dropdown departemen
    const toggleDepartment = (deptIndex) => {
        setExpandedDepartments((prev) => ({
            ...prev,
            [deptIndex]: !prev[deptIndex],
        }));
    };

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
            logoContainer: {
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
            },
            logoImg: {
                width: width <= 480 ? '120px' : '150px',
                height: width <= 480 ? '120px' : '150px',
                objectFit: 'contain',
            },
            textContent: {
                fontSize: width <= 768 ? '14px' : '16px',
                color: '#718096',
                lineHeight: '1.6',
                marginBottom: '15px',
            },
            listItem: {
                fontSize: width <= 768 ? '14px' : '16px',
                color: '#718096',
                marginBottom: '10px',
                lineHeight: '1.5',
            },
            positionGrid: {
                display: 'grid',
                gridTemplateColumns: width <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
            },
            positionCard: {
                background: 'linear-gradient(90deg, #ffffff 0%, #f9f9f9 100%)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
            },
            positionCardHover: {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
            },
            positionImg: {
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '50%',
                margin: '0 auto 10px',
            },
            positionTitle: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '5px',
            },
            positionName: {
                fontSize: '14px',
                color: '#718096',
            },
            departmentHeader: {
                background: 'linear-gradient(90deg, #007bff 0%, #00c4ff 100%)',
                color: '#fff',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px',
            },
            departmentTitle: {
                fontSize: '16px',
                fontWeight: '600',
            },
            departmentContent: {
                padding: '15px',
                background: '#f9f9f9',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: width <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
            },
            memberCard: {
                background: 'linear-gradient(90deg, #ffffff 0%, #f9f9f9 100%)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
            },
            memberCardHover: {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
            },
            memberImg: {
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '50%',
                margin: '0 auto 10px',
            },
            memberPosition: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '5px',
            },
            memberName: {
                fontSize: '14px',
                color: '#718096',
            },
            recruitmentStatus: {
                background: bem?.recruitment_status === 'OPEN' ? '#28a745' : '#dc3545',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                marginTop: '20px',
                display: 'inline-block',
            },
            recruitmentLink: {
                display: 'block',
                textAlign: 'center',
                marginTop: '10px',
                color: '#007bff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
            },
            recruitmentLinkHover: {
                color: '#0056b3',
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
            <Head title="BEM IT Del" />
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
                            {bem ? (
                                <>
                                    {/* Introduction Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Badan Eksekutif Mahasiswa (BEM)</h2>
                                        {bem.logo && (
                                            <div style={styles.logoContainer}>
                                                <img
                                                    src={`/storage/${bem.logo}`}
                                                    alt="Logo BEM IT Del"
                                                    style={styles.logoImg}
                                                />
                                            </div>
                                        )}
                                        <p style={styles.textContent}>{bem.introduction}</p>
                                    </div>

                                    {/* Visi & Misi Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Visi & Misi BEM</h2>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>
                                            Visi
                                        </h3>
                                        <p style={styles.textContent}>{bem.vision}</p>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '10px', marginTop: '20px' }}>
                                            Misi
                                        </h3>
                                        <ul style={{ paddingLeft: '20px' }}>
                                            {bem.mission?.map((mission, index) => (
                                                <li key={index} style={styles.listItem}>
                                                    {mission}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Struktur Organisasi Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Struktur Organisasi BEM</h2>

                                        {/* Jabatan Utama (BPH) */}
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                            BPH BEM IT Del
                                        </h3>
                                        <div style={styles.positionGrid}>
                                            {bem.structure?.positions?.map((position, index) => (
                                                <div
                                                    key={index}
                                                    style={styles.positionCard}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = styles.positionCardHover.transform;
                                                        e.currentTarget.style.boxShadow = styles.positionCardHover.boxShadow;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'none';
                                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                                                    }}
                                                >
                                                    {position.photo ? (
                                                        <img
                                                            src={`/storage/${position.photo}`}
                                                            alt={position.name}
                                                            style={styles.positionImg}
                                                        />
                                                    ) : (
                                                        <div style={{ ...styles.positionImg, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                                                            Tidak ada foto
                                                        </div>
                                                    )}
                                                    <div style={styles.positionTitle}>{position.title}</div>
                                                    <div style={styles.positionName}>{position.name}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Departemen */}
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '15px', marginTop: '20px' }}>
                                            Departemen
                                        </h3>
                                        {bem.structure?.departments?.map((dept, deptIndex) => (
                                            <div key={deptIndex}>
                                                <div
                                                    style={styles.departmentHeader}
                                                    onClick={() => toggleDepartment(deptIndex)}
                                                >
                                                    <span style={styles.departmentTitle}>{dept.name}</span>
                                                    <svg
                                                        className={`w-5 h-5 transition-transform ${expandedDepartments[deptIndex] ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                                {expandedDepartments[deptIndex] && (
                                                    <div style={styles.departmentContent}>
                                                        {dept.members && dept.members.length > 0 ? (
                                                            dept.members.map((member, memberIndex) => (
                                                                <div
                                                                    key={memberIndex}
                                                                    style={styles.memberCard}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.transform = styles.memberCardHover.transform;
                                                                        e.currentTarget.style.boxShadow = styles.memberCardHover.boxShadow;
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = 'none';
                                                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                                                                    }}
                                                                >
                                                                    {member.photo ? (
                                                                        <img
                                                                            src={`/storage/${member.photo}`}
                                                                            alt={member.name}
                                                                            style={styles.memberImg}
                                                                        />
                                                                    ) : (
                                                                        <div style={{ ...styles.memberImg, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                                                                            Tidak ada foto
                                                                        </div>
                                                                    )}
                                                                    <div style={styles.memberPosition}>{member.position}</div>
                                                                    <div style={styles.memberName}>{member.name}</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p style={styles.textContent}>Belum ada anggota di departemen ini.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Program Kerja Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Program Kerja BEM</h2>
                                        <p style={styles.textContent}>{bem.work_programs?.description}</p>
                                        <ul style={{ paddingLeft: '20px' }}>
                                            {bem.work_programs?.programs?.map((program, index) => (
                                                <li key={index} style={styles.listItem}>
                                                    {program}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Partisipasi Anda Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Partisipasi Anda</h2>
                                        <div style={styles.recruitmentStatus}>
                                            {bem.recruitment_status === 'OPEN' ? 'OPEN RECRUITMENT' : 'CLOSED RECRUITMENT'}
                                        </div>
                                        {bem.recruitment_status === 'OPEN' && (
                                            <a
                                                href="#"
                                                style={styles.recruitmentLink}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = styles.recruitmentLinkHover.color;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#007bff';
                                                }}
                                            >
                                                Daftar Sekarang!
                                            </a>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div style={styles.emptyState}>
                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <h3 style={styles.emptyStateTitle}>Tidak ada data BEM</h3>
                                    <p style={styles.emptyStateText}>Belum ada data BEM yang tersedia saat ini.</p>
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