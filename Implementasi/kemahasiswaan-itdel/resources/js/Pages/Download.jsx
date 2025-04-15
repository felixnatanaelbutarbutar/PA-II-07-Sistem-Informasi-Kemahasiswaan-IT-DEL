import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';

export default function Download({ downloads }) {
    const truncateText = (text, maxLength) => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title="Daftar Unduhan" />

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
                        backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 max-w-7xl w-full;
                    }
                    .header-section h1 {
                        font-size: 2.5rem;
                        font-weight: 700;
                        background: linear-gradient(to right, #1e3a8a, #3b82f6);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                    }
                    .header-section p {
                        color: #6b7280;
                        margin-top: 0.5rem;
                    }
                    .table-container {
                        background: #ffffff;
                        border-radius: 1rem;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        overflow: hidden;
                        border: 1px solid rgba(229, 231, 235, 0.5);
                        max-width: 7xl;
                        width: 100%;
                    }
                    .table-header {
                        background: linear-gradient(to right, #1e40af, #3b82f6);
                        color: #ffffff;
                    }
                    .table-header th {
                        padding: 0.75rem 1.5rem;
                        text-align: left;
                        font-size: 0.75rem;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    .table-body tr {
                        transition: background 0.2s ease;
                    }
                    .table-body tr:hover {
                        background: #f9fafb;
                    }
                    .table-body td {
                        padding: 1rem 1.5rem;
                        white-space: nowrap;
                        font-size: 0.875rem;
                        color: #4b5563;
                    }
                    .table-body td:first-child {
                        font-weight: 500;
                        color: #1f2937;
                    }
                    .table-body a {
                        color: #2563eb;
                        text-decoration: none;
                        font-weight: 600;
                        transition: color 0.3s ease;
                    }
                    .table-body a:hover {
                        color: #1e40af;
                        text-decoration: underline;
                    }
                    .empty-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 4rem;
                        background: #ffffff;
                        border-radius: 1rem;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        border: 1px solid rgba(229, 231, 235, 0.5);
                        max-width: 7xl;
                        width: 100%;
                    }
                    .empty-state .icon-container {
                        width: 6rem;
                        height: 6rem;
                        background: #dbeafe;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 1.5rem;
                    }
                    .empty-state svg {
                        width: 3rem;
                        height: 3rem;
                        color: #3b82f6;
                    }
                    .empty-state h3 {
                        font-size: 1.25rem;
                        font-weight: 500;
                        color: #374151;
                        margin-bottom: 0.5rem;
                    }
                    .empty-state p {
                        color: #6b7280;
                        text-align: center;
                        max-width: 28rem;
                    }
                    @media (max-width: 768px) {
                        .main-container {
                            padding: 40px 15px;
                        }
                        .header-section {
                            padding: 1.5rem;
                        }
                        .header-section h1 {
                            font-size: 2rem;
                        }
                        .table-header th,
                        .table-body td {
                            padding: 0.5rem 1rem;
                            font-size: 0.75rem;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                {/* Header */}
                <div className="header-section">
                    <h1>Daftar Unduhan</h1>
                    <p>File unduhan yang tersedia untuk Anda.</p>
                </div>

                {/* Tabel Unduhan */}
                {downloads.length > 0 ? (
                    <div className="table-container">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="table-header">
                                <tr>
                                    <th>Judul</th>
                                    <th>Deskripsi</th>
                                    <th>File</th>
                                    <th>File Path (Debug)</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {downloads.map((download) => (
                                    <tr key={download.id}>
                                        <td>{download.title}</td>
                                        <td>{truncateText(download.description, 30)}</td>
                                        <td>
                                            <a
                                                href={`/storage/${download.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Unduh File
                                            </a>
                                        </td>
                                        <td>{download.file_path}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon-container">
                            <svg
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
                        </div>
                        <h3>Tidak ada file unduhan yang tersedia</h3>
                        <p>Saat ini belum ada file unduhan yang dapat diakses.</p>
                    </div>
                )}
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}