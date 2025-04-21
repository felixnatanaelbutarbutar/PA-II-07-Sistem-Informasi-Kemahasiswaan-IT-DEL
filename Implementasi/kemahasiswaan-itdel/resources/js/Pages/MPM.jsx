import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function MPM({ mpm }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulasi loading data
    useEffect(() => {
        if (mpm) {
            setIsLoading(false);
        } else {
            setError('Gagal memuat data MPM');
            setIsLoading(false);
        }
    }, [mpm]);

    // Fungsi untuk mendapatkan style responsif
    const getResponsiveStyles = () => {
        const width = window.innerWidth;
        const isMobile = width <= 768; // Tentukan apakah layar adalah mobile

        return {
            body: {
                fontFamily: "'Arial', sans-serif",
                margin: 0,
                padding: 0,
                background: '#f7f9fc',
                minHeight: '100vh',
            },
            container: {
                maxWidth: '900px',
                margin: '0 auto',
                padding: isMobile ? '10px' : '20px',
            },
            section: {
                background: '#fff',
                padding: isMobile ? '15px' : '20px',
                marginBottom: '20px',
                textAlign: 'left', // Memastikan teks rata kiri
                border: '1px solid #d1e7ff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            },
            headerSection: {
                background: '#fff',
                padding: isMobile ? '15px' : '20px',
                marginBottom: '20px',
                textAlign: 'left',
                border: '1px solid #d1e7ff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            },
            logoContainer: {
                flexShrink: 0,
                marginRight: isMobile ? '10px' : '15px',
                marginBottom: '0',
                position: 'relative',
                width: isMobile ? '60px' : '80px',
                height: isMobile ? '60px' : '80px',
                overflow: 'visible',
                border: 'none',
                outline: 'none',
            },
            logo: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                border: 'none',
                outline: 'none',
                display: 'block',
                background: 'transparent',
            },
            contentContainer: {
                flex: 1,
                maxWidth: '600px',
            },
            sectionTitle: {
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '700',
                color: '#000',
                marginBottom: '15px',
                borderBottom: '2px solid #007bff',
                paddingBottom: '5px',
            },
            textContent: {
                fontSize: isMobile ? '14px' : '16px',
                color: '#000',
                lineHeight: '1.6',
                marginBottom: '5px',
                textAlign: 'center', // Memusatkan teks di atas gambar
            },
            subTitle: {
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#000',
                marginBottom: '5px',
                marginTop: '15px',
            },
            memberTitle: {
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '700',
                color: '#000',
                marginBottom: '5px',
                marginTop: '15px',
            },
            listContainer: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                textAlign: 'left', // Memastikan daftar misi rata kiri
            },
            listItem: {
                fontSize: isMobile ? '14px' : '16px',
                color: '#000',
                lineHeight: '1.5',
                marginBottom: '5px',
            },
            buttonContainer: {
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px',
                flexWrap: 'wrap',
            },
            button: {
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#fff',
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none',
            },
            recruitmentButton: {
                background: '#28a745',
            },
            aspirationButton: {
                background: '#007bff',
            },
            buttonIcon: {
                width: '20px',
                height: '20px',
                marginRight: '8px',
            },
            emptyState: {
                textAlign: 'center',
                padding: '40px',
                background: '#fff',
                border: '1px solid #d1e7ff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            },
            emptyStateTitle: {
                fontSize: '20px',
                fontWeight: '500',
                color: '#000',
                marginBottom: '10px',
            },
            emptyStateText: {
                color: '#000',
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
                background: '#fff',
                border: '1px solid #d1e7ff',
                borderRadius: '8px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            },
            statusText: {
                fontSize: isMobile ? '14px' : '16px',
                color: '#fff',
                marginBottom: '10px',
                fontWeight: '500',
            },
            participationSection: {
                background: '#dc2626',
                padding: isMobile ? '15px' : '20px',
                marginBottom: '20px',
                textAlign: 'center',
                border: '1px solid #d1e7ff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            },
            photo: {
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '0',
            },
            photoContainer: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: '20px',
                marginBottom: '10px',
            },
            leaderContainer: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '15px',
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
            <Head title="MPM IT Del" />
            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Error Message */}
                    {error && <div style={styles.errorMessage}>{error}</div>}

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
                            {mpm ? (
                                <>
                                    {/* Header Section */}
                                    <div style={styles.headerSection}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            {mpm.logo && (
                                                <div style={styles.logoContainer}>
                                                    <img
                                                        src={`/storage/${mpm.logo}`}
                                                        alt="Logo MPM"
                                                        style={styles.logo}
                                                        onError={(e) => (e.target.style.display = 'none')} // Sembunyikan jika gambar gagal dimuat
                                                    />
                                                </div>
                                            )}
                                            <h2 style={styles.sectionTitle}>Majelis Permusyawaratan Mahasiswa (MPM)</h2>
                                        </div>
                                        <div style={styles.contentContainer}>
                                            <p style={styles.textContent}>{mpm.introduction || 'Tidak ada'}</p>
                                            {/* Ketua dan Sekretaris dalam satu baris */}
                                            <div style={styles.leaderContainer}>
                                                <div style={styles.photoContainer}>
                                                    <p style={styles.textContent}>
                                                        <strong>Ketua:</strong>
                                                    </p>
                                                    <p style={styles.textContent}>
                                                        {mpm.structure?.chairman?.name || 'Tidak ada'}
                                                    </p>
                                                    {mpm.structure?.chairman?.photo && (
                                                        <img
                                                            src={`/storage/${mpm.structure.chairman.photo}`}
                                                            alt="Foto Ketua"
                                                            style={styles.photo}
                                                            onError={(e) => (e.target.style.display = 'none')} // Sembunyikan jika gambar gagal dimuat
                                                        />
                                                    )}
                                                </div>
                                                <div style={styles.photoContainer}>
                                                    <p style={styles.textContent}>
                                                        <strong>Sekretaris:</strong>
                                                    </p>
                                                    <p style={styles.textContent}>
                                                        {mpm.structure?.secretary?.name || 'Tidak ada'}
                                                    </p>
                                                    {mpm.structure?.secretary?.photo && (
                                                        <img
                                                            src={`/storage/${mpm.structure.secretary.photo}`}
                                                            alt="Foto Sekretaris"
                                                            style={styles.photo}
                                                            onError={(e) => (e.target.style.display = 'none')} // Sembunyikan jika gambar gagal dimuat
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visi & Misi Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Visi & Misi MPM</h2>
                                        <h3 style={styles.subTitle}>Visi</h3>
                                        <p style={{ ...styles.textContent, textAlign: 'left' }}>
                                            {mpm.vision || 'Tidak ada'}
                                        </p>
                                        <h3 style={styles.subTitle}>Misi</h3>
                                        <div style={styles.listContainer}>
                                            {mpm.mission && mpm.mission.length > 0 ? (
                                                <ul style={{ paddingLeft: '20px' }}>
                                                    {mpm.mission.map((mission, index) => (
                                                        <li key={index} style={styles.listItem}>
                                                            - {mission || 'Misi Tanpa Deskripsi'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p style={{ ...styles.textContent, textAlign: 'left' }}>
                                                    Tidak ada misi
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Struktur Komisi Section */}
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Struktur Komisi MPM</h2>
                                        {mpm.structure?.commissions && mpm.structure.commissions.length > 0 ? (
                                            mpm.structure.commissions.map((commission, index) => (
                                                <div key={index}>
                                                    <h3 style={styles.subTitle}>
                                                        {commission.name || 'Komisi Tanpa Nama'}
                                                    </h3>
                                                    {/* Ketua dan Anggota dalam satu baris */}
                                                    <div style={styles.leaderContainer}>
                                                        {/* Ketua */}
                                                        <div style={styles.photoContainer}>
                                                            <p style={styles.textContent}>
                                                                <strong>Ketua:</strong>
                                                            </p>
                                                            <p style={styles.textContent}>
                                                                {commission.chairman?.name || 'Tidak ada'}
                                                            </p>
                                                            {commission.chairman?.photo && (
                                                                <img
                                                                    src={`/storage/${commission.chairman.photo}`}
                                                                    alt={`Foto Ketua ${commission.name || 'Komisi'}`}
                                                                    style={styles.photo}
                                                                    onError={(e) =>
                                                                        (e.target.style.display = 'none')
                                                                    } // Sembunyikan jika gambar gagal dimuat
                                                                />
                                                            )}
                                                        </div>
                                                        {/* Anggota */}
                                                        {commission.members && commission.members.length > 0 && (
                                                            <>
                                                                {commission.members.map((member, memberIndex) => (
                                                                    <div
                                                                        key={memberIndex}
                                                                        style={styles.photoContainer}
                                                                    >
                                                                        <p style={styles.textContent}>
                                                                            <strong>Anggota:</strong>
                                                                        </p>
                                                                        <p style={styles.textContent}>
                                                                            {member.name || 'Anggota Tanpa Nama'}
                                                                        </p>
                                                                        {member.photo && (
                                                                            <img
                                                                                src={`/storage/${member.photo}`}
                                                                                alt={`Foto ${member.name || 'Anggota'}`}
                                                                                style={styles.photo}
                                                                                onError={(e) =>
                                                                                    (e.target.style.display = 'none')
                                                                                } // Sembunyikan jika gambar gagal dimuat
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                    {commission.work_programs &&
                                                        commission.work_programs.length > 0 && (
                                                            <>
                                                                <h4 style={styles.memberTitle}>Program Kerja:</h4>
                                                                <div style={styles.listContainer}>
                                                                    <ul style={{ paddingLeft: '20px' }}>
                                                                        {commission.work_programs.map(
                                                                            (program, programIndex) => (
                                                                                <li
                                                                                    key={programIndex}
                                                                                    style={styles.listItem}
                                                                                >
                                                                                    -{' '}
                                                                                    {program ||
                                                                                        'Program Tanpa Deskripsi'}
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            </>
                                                        )}
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ ...styles.textContent, textAlign: 'left' }}>
                                                Tidak ada komisi
                                            </p>
                                        )}
                                    </div>

                                    {/* Partisipasi Anda Section */}
                                    <div style={styles.participationSection}>
                                        <h2
                                            style={{
                                                ...styles.sectionTitle,
                                                color: '#fff',
                                                borderBottom: '2px solid #fff',
                                            }}
                                        >
                                            Partisipasi Anda
                                        </h2>
                                        {mpm.recruitment_status && (
                                            <p style={styles.statusText}>
                                                Status Rekrutmen:{' '}
                                                {mpm.recruitment_status === 'OPEN' ? 'Dibuka' : 'Ditutup'}
                                            </p>
                                        )}
                                        <div style={styles.buttonContainer}>
                                            <a href="#" style={{ ...styles.button, ...styles.recruitmentButton }}>
                                                <svg
                                                    style={styles.buttonIcon}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                                Open Recruitment
                                            </a>
                                            <a href="#" style={{ ...styles.button, ...styles.aspirationButton }}>
                                                <svg
                                                    style={styles.buttonIcon}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                                    />
                                                </svg>
                                                Pendataan Aspirasi
                                            </a>
                                        </div>
                                    </div>
                                </>
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
                                    <h3 style={styles.emptyStateTitle}>Tidak ada data MPM</h3>
                                    <p style={styles.emptyStateText}>Belum ada data MPM yang tersedia saat ini.</p>
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
