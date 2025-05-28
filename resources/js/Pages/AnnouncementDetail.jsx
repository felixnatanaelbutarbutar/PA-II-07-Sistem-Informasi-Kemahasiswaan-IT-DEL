import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css'; // Impor CSS Quill

export default function AnnouncementDetail() {
    const { props } = usePage();
    const announcementId = props.announcement_id || window.location.pathname.split('https://kemahasiswaanitdel.site/').pop();
    const [announcement, setAnnouncement] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/announcements/${announcementId}`);
                if (!response.ok) {
                    throw new Error('Gagal mengambil detail pengumuman');
                }
                const data = await response.json();
                setAnnouncement(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnouncement();
    }, [announcementId]);

    const renderFile = (item) => {
        if (!item || (!item.file && !item.image)) {
            return (
                <div style={styles.fileContainer} className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm">Tidak ada file</span>
                </div>
            );
        }

        const filePath = item.file || item.image;
        if (!filePath) {
            return (
                <div style={styles.fileContainer} className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm">Tidak ada file</span>
                </div>
            );
        }

        if (filePath.toLowerCase().endsWith('.pdf')) {
            return (
                <a
                    href={`/storage/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    style={styles.fileContainer}
                >
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm">Lihat PDF</span>
                </a>
            );
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const isImage = imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
        if (isImage) {
            return (
                <img
                    src={`/storage/${filePath}`}
                    alt={item?.title || 'Gambar pengumuman'}
                    style={styles.fileContainer}
                    onError={(e) => {
                        e.target.outerHTML = `
                            <div style="${Object.entries(styles.fileContainer).map(([key, value]) => `${key}: ${value}`).join(';')}" class="flex flex-col items-center justify-center text-gray-500">
                                <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                                </svg>
                                <span class="mt-2 text-sm">Gambar gagal dimuat</span>
                            </div>
                        `;
                    }}
                />
            );
        }

        return (
            <a
                href={`/storage/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full text-blue-600 hover:text-blue-800 transition-colors duration-200"
                style={styles.fileContainer}
            >
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="mt-2 text-sm">Lihat File</span>
            </a>
        );
    };

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
            detailContainer: {
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                padding: width <= 768 ? '15px' : '30px',
                backdropFilter: 'blur(10px)',
                marginBottom: '20px',
                transition: 'transform 0.3s, box-shadow 0.3s',
            },
            detailContainerHover: {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            },
            header: {
                display: 'flex',
                flexDirection: width <= 768 ? 'column' : 'row',
                gap: '20px',
                marginBottom: '20px',
                alignItems: width <= 768 ? 'center' : 'flex-start',
            },
            fileContainer: {
                width: width <= 768 ? '100%' : '400px',
                height: width <= 768 ? '200px' : '300px',
                objectFit: 'cover',
                borderRadius: '12px',
                transition: 'transform 0.3s',
            },
            fileContainerHover: {
                transform: 'scale(1.02)',
            },
            headerContent: {
                flex: 1,
                textAlign: width <= 768 ? 'center' : 'left',
            },
            category: {
                background: 'linear-gradient(45deg, #007bff, #00c4ff)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: width <= 480 ? '12px' : '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '10px',
            },
            title: {
                fontSize: width <= 768 ? '24px' : '32px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '10px',
                lineHeight: '1.3',
            },
            meta: {
                fontSize: width <= 480 ? '12px' : '14px',
                color: '#718096',
                marginBottom: '15px',
            },
            content: {
                fontSize: width <= 480 ? '14px' : '16px',
                color: '#4a5568',
                lineHeight: '1.8',
                marginBottom: '20px',
            },
            contentQuill: {
                // Tambahkan gaya tambahan untuk mendukung Quill
                '& .ql-align-center': { textAlign: 'center' },
                '& .ql-align-right': { textAlign: 'right' },
                '& .ql-align-justify': { textAlign: 'justify' },
                '& .ql-editor': { padding: '0', margin: '0' }, // Pastikan kompatibel dengan Quill
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
            notFound: {
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
            },
            notFoundTitle: {
                fontSize: '20px',
                fontWeight: '500',
                color: '#4a4a4a',
                marginBottom: '10px',
            },
            notFoundText: {
                color: '#718096',
                fontSize: '16px',
            },
        };
    };

    const [styles, setStyles] = useState(getResponsiveStyles());

    useEffect(() => {
        const handleResize = () => {
            setStyles(getResponsiveStyles());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <GuestLayout>
            <Navbar showBreadcrumbAndHeader={false} />
            <Head title={announcement?.title || "Detail Pengumuman"} />
            <div style={styles.body}>
                <div style={styles.container}>
                    {/* Tombol Kembali */}
                    <Link
                        href="/announcement"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Kembali ke Halaman Pengumuman
                    </Link>

                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

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
                    ) : announcement ? (
                        <div
                            style={styles.detailContainer}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = styles.detailContainerHover.transform;
                                e.currentTarget.style.boxShadow = styles.detailContainerHover.boxShadow;
                                const img = e.currentTarget.querySelector('img');
                                if (img) img.style.transform = styles.fileContainerHover.transform;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                                const img = e.currentTarget.querySelector('img');
                                if (img) img.style.transform = 'none';
                            }}
                        >
                            <div style={styles.header}>
                                {renderFile(announcement)}
                                <div style={styles.headerContent}>
                                    <div style={styles.category}>
                                        {announcement.category?.category_name || "Uncategorized"}
                                    </div>
                                    <h1 style={styles.title}>
                                        {announcement.title || "Tanpa Judul"}
                                    </h1>
                                    <div style={styles.meta}>
                                        Dipublikasikan pada {formatDate(announcement.created_at)}
                                    </div>
                                </div>
                            </div>
                            {/* Render konten dengan kelas Quill */}
                            <div
                                className="ql-editor" // Tambahkan kelas ql-editor untuk styling Quill
                                style={styles.content}
                                dangerouslySetInnerHTML={{ __html: announcement.content || "Tidak ada konten." }}
                            />
                        </div>
                    ) : (
                        <div style={styles.notFound}>
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <h3 style={styles.notFoundTitle}>
                                Pengumuman Tidak Ditemukan
                            </h3>
                            <p style={styles.notFoundText}>
                                Pengumuman yang Anda cari tidak ditemukan atau telah dihapus.
                            </p>
                            {/* Tombol Kembali di Not Found */}
                            <Link
                                href="/announcement"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-6"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Kembali ke Halaman Pengumuman
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}