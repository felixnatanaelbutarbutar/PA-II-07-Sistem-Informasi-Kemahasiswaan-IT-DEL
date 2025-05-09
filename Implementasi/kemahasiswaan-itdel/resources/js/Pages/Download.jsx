import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import ChatbotWidget from '@/Layouts/Chatbot';
import { useState, useEffect } from 'react';

export default function Download({ downloads, categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDownloads, setFilteredDownloads] = useState(downloads);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    // Simulasi loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Filter berdasarkan pencarian dan kategori
    useEffect(() => {
        let results = downloads;

        // Filter berdasarkan pencarian
        if (searchTerm) {
            results = results.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter berdasarkan kategori
        if (activeCategory !== 'all') {
            results = results.filter(item => item.category_id === parseInt(activeCategory));
        }

        setFilteredDownloads(results);
    }, [searchTerm, activeCategory, downloads]);

    const filterByCategory = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const truncateText = (text, maxLength) => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Fungsi untuk mendapatkan icon berdasarkan ekstensi file
    const getFileIcon = (filePath) => {
        if (!filePath) return 'document';
        
        const extension = filePath.split('.').pop().toLowerCase();
        
        const icons = {
            pdf: 'file-pdf',
            doc: 'file-word',
            docx: 'file-word',
            xls: 'file-excel',
            xlsx: 'file-excel',
            ppt: 'file-powerpoint',
            pptx: 'file-powerpoint',
            jpg: 'file-image',
            jpeg: 'file-image',
            png: 'file-image',
            gif: 'file-image',
            zip: 'file-archive',
            rar: 'file-archive',
            txt: 'file-text',
        };
        
        return icons[extension] || 'document';
    };

    // Tambahkan kategori "Semua" ke daftar kategori
    const allCategories = [
        { id: 'all', name: 'Semua' },
        ...categories
    ];

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title="Daftar Unduhan" />

            {/* CSS Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', Arial, sans-serif;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    background-attachment: fixed;
                }
                
                .main-container {
                    min-height: 100vh;
                    padding: 40px 20px 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .header-section {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                    padding: 2rem;
                    margin-bottom: 2rem;
                    width: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #3b82f6, #1e3a8a);
                    z-index: 1;
                }
                
                .header-section h1 {
                    font-size: 2.75rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(90deg, #1e3a8a, #3b82f6);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    letter-spacing: -0.5px;
                }
                
                .header-section p {
                    color: #6b7280;
                    margin-top: 0.75rem;
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .controls-section {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    margin-bottom: 1.5rem;
                    gap: 1rem;
                }
                
                @media (min-width: 768px) {
                    .controls-section {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
                }
                
                .search-container {
                    position: relative;
                    flex-grow: 1;
                }
                
                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(229, 231, 235, 0.8);
                    background: rgba(255, 255, 255, 0.9);
                    font-size: 0.95rem;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    outline: none;
                }
                
                .search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }
                
                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6b7280;
                }
                
                .category-tabs {
                    display: flex;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    gap: 0.75rem;
                    padding-bottom: 0.5rem;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .category-tabs::-webkit-scrollbar {
                    display: none;
                }
                
                .category-tab {
                    padding: 0.6rem 1.2rem;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(229, 231, 235, 0.8);
                }
                
                .category-tab:hover {
                    background: rgba(240, 245, 255, 0.9);
                }
                
                .category-tab.active {
                    background: linear-gradient(90deg, #3b82f6, #1e3a8a);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);
                }
                
                .download-cards {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 1.5rem;
                    width: 100%;
                }
                
                @media (min-width: 640px) {
                    .download-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (min-width: 1024px) {
                    .download-cards {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                .download-card {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    border: 1px solid rgba(229, 231, 235, 0.5);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .download-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
                }
                
                .card-header {
                    background: linear-gradient(90deg, #3b82f6, #1e3a8a);
                    padding: 1rem;
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                
                .card-body {
                    padding: 1.25rem;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .file-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e5e7eb;
                    border-radius: 8px;
                    color: #1e3a8a;
                }
                
                .card-title {
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: #1f2937;
                    margin-bottom: 0.75rem;
                    text-align: center;
                }
                
                .card-description {
                    color: #6b7280;
                    font-size: 0.95rem;
                    margin-bottom: 1.5rem;
                    flex-grow: 1;
                }
                
                .download-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    background: linear-gradient(90deg, #3b82f6, #1e3a8a);
                    color: white;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    gap: 0.5rem;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);
                }
                
                .download-button:hover {
                    background: linear-gradient(90deg, #2563eb, #1e40af);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
                }
                
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 16px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(229, 231, 235, 0.5);
                    width: 100%;
                }
                
                .icon-container {
                    width: 6rem;
                    height: 6rem;
                    background: #dbeafe;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }
                
                .icon-container svg {
                    width: 3rem;
                    height: 3rem;
                    color: #3b82f6;
                }
                
                .empty-state h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.75rem;
                }
                
                .empty-state p {
                    color: #6b7280;
                    max-width: 32rem;
                }
                
                .loading-skeleton {
                    background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 8px;
                }
                
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                .loader-card {
                    height: 220px;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .loader-header {
                    height: 50px;
                    margin-bottom: 12px;
                }
                
                .loader-icon {
                    width: 48px;
                    height: 48px;
                    margin: 12px auto;
                    border-radius: 8px;
                }
                
                .loader-title {
                    height: 20px;
                    margin: 12px auto;
                    width: 80%;
                }
                
                .loader-desc {
                    height: 40px;
                    margin: 12px auto;
                    width: 100%;
                }
                
                .loader-button {
                    height: 40px;
                    margin: 12px auto 0;
                    width: 100%;
                    border-radius: 8px;
                }
                
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                
                .loading-dots {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding-top: 2rem;
                }
                
                .dot {
                    width: 12px;
                    height: 12px;
                    margin: 0 6px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    display: inline-block;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
            `}</style>

            {/* Main Container */}
            <div className="main-container">
                {/* Header */}
                    {/* <div className="header-section">
                        <h1>Daftar Unduhan</h1>
                        <p>Akses berbagai dokumen, formulir, dan panduan yang tersedia untuk mendukung kegiatan akademik Anda.</p>
                    </div> */}

                {/* Controls Section */}
                <div className="controls-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Cari file atau dokumen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="search-icon">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="category-tabs">
                    {allCategories.map(category => (
                        <div
                            key={category.id}
                            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => filterByCategory(category.id)}
                        >
                            {category.name}
                        </div>
                    ))}
                </div>

                {/* Content Section */}
                {isLoading ? (
                    <div className="download-cards">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="loader-card">
                                <div className="loader-header loading-skeleton"></div>
                                <div className="loader-icon loading-skeleton"></div>
                                <div className="loader-title loading-skeleton"></div>
                                <div className="loader-desc loading-skeleton"></div>
                                <div className="loader-button loading<ElementRef>skeleton"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredDownloads.length > 0 ? (
                    <div className="download-cards">
                        {filteredDownloads.map((download) => (
                            <div key={download.id} className="download-card">
                                <div className="card-header">
                                    {download.category || 'Tanpa Kategori'}
                                </div>
                                <div className="card-body">
                                    <div className="file-icon">
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="card-title">{download.title}</h3>
                                    <p className="card-description">
                                        {download.description ? truncateText(download.description, 100) : 'Tidak ada deskripsi'}
                                    </p>
                                    <a
                                        href={`/storage/${download.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="download-button"
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Unduh File
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon-container">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3>Tidak ada file unduhan yang tersedia</h3>
                        <p>
                            {searchTerm 
                                ? `Tidak ada file yang cocok dengan pencarian "${searchTerm}". Silakan coba kata kunci lain.` 
                                : 'Saat ini belum ada file unduhan yang dapat diakses.'}
                        </p>
                    </div>
                )}
            </div>

            <ChatbotWidget />
            <FooterLayout />
        </GuestLayout>
    );
}