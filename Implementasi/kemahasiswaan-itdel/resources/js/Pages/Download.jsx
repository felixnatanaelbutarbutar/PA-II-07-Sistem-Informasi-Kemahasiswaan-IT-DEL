import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot'; // Impor ChatbotWidget
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Download({ download }) {
    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title={`Detail Unduhan - ${download.title}`} />

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
                    .download-section {
                        max-width: 1000px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        padding: 40px;
                        margin-bottom: 40px;
                        background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
                    }
                    .download-section h2 {
                        font-size: 28px;
                        font-weight: 700;
                        color: #1e40af;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .download-section .subheader {
                        text-align: center;
                        color: #6b7280;
                        font-size: 16px;
                        margin-bottom: 30px;
                    }
                    .download-details {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .download-details .detail-item {
                        margin-bottom: 20px;
                    }
                    .download-details .detail-item label {
                        font-weight: 600;
                        color: #1f2937;
                        display: block;
                        margin-bottom: 8px;
                    }
                    .download-details .detail-item p {
                        font-size: 16px;
                        color: #4b5563;
                        line-height: 1.6;
                    }
                    .download-details .detail-item a {
                        color: #2563eb;
                        text-decoration: underline;
                        transition: color 0.3s ease;
                    }
                    .download-details .detail-item a:hover {
                        color: #1e40af;
                    }
                    .download-button {
                        background: #2563eb;
                        color: #ffffff;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        width: 100%;
                        max-width: 300px;
                        margin: 20px auto 0;
                        transition: background 0.3s ease, transform 0.3s ease;
                    }
                    .download-button:hover {
                        background: #1e40af;
                        transform: translateY(-2px);
                    }
                    .back-button {
                        background: #6b7280;
                        color: #ffffff;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        width: 100%;
                        max-width: 300px;
                        margin: 20px auto 0;
                        transition: background 0.3s ease, transform 0.3s ease;
                    }
                    .back-button:hover {
                        background: #4b5563;
                        transform: translateY(-2px);
                    }
                    .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        flex-wrap: wrap;
                    }
                    @media (max-width: 768px) {
                        .main-container {
                            padding: 40px 15px;
                        }
                        .download-section {
                            padding: 30px;
                        }
                        .download-section h2 {
                            font-size: 24px;
                        }
                        .button-group {
                            flex-direction: column;
                            align-items: center;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                {/* Download Detail Section */}
                <div className="download-section">
                    <h2>Detail Unduhan</h2>
                    <p className="subheader">
                        Informasi lengkap tentang file unduhan yang Anda pilih.
                    </p>
                    <div className="download-details">
                        <div className="detail-item">
                            <label>Judul</label>
                            <p>{download.title}</p>
                        </div>
                        <div className="detail-item">
                            <label>Deskripsi</label>
                            <p>{download.description || 'Tidak ada deskripsi tersedia.'}</p>
                        </div>
                        <div className="detail-item">
                            <label>File</label>
                            <p>
                                <a
                                    href={`/storage/${download.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Lihat atau Unduh File
                                </a>
                            </p>
                        </div>
                        <div className="detail-item">
                            <label>Dibuat oleh</label>
                            <p>{download.creator?.name || 'Tidak diketahui'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Tanggal Dibuat</label>
                            <p>
                                {download.created_at
                                    ? format(new Date(download.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })
                                    : 'Tidak diketahui'}
                            </p>
                        </div>
                        <div className="detail-item">
                            <label>Diperbarui oleh</label>
                            <p>{download.updater?.name || 'Tidak diketahui'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Tanggal Diperbarui</label>
                            <p>
                                {download.updated_at
                                    ? format(new Date(download.updated_at), 'dd MMMM yyyy, HH:mm', { locale: id })
                                    : 'Tidak diketahui'}
                            </p>
                        </div>
                        <div className="button-group">
                            <a
                                href={`/storage/${download.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="download-button"
                            >
                                <img
                                    src="https://img.icons8.com/ios-filled/50/ffffff/download.png"
                                    width="16"
                                    height="16"
                                    alt="Download Icon"
                                />
                                Unduh File
                            </a>
                            <Link href="/downloads" className="back-button">
                                <img
                                    src="https://img.icons8.com/ios-filled/50/ffffff/back.png"
                                    width="16"
                                    height="16"
                                    alt="Back Icon"
                                />
                                Kembali ke Daftar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chatbot Widget */}
            <ChatbotWidget />

            <FooterLayout />
        </GuestLayout>
    );
}