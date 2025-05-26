import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Announcement() {
    const [announcements, setAnnouncements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    // Fetch data from API when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get announcements list
                const announcementsResponse = await fetch('http://localhost:8000/api/announcements');
                if (!announcementsResponse.ok) {
                    throw new Error('Gagal mengambil data pengumuman');
                }
                const announcementsData = await announcementsResponse.json();
                setAnnouncements(announcementsData.data || []);

                // Get categories list
                const categoriesResponse = await fetch('http://localhost:8000/api/announcement-categories');
                if (!categoriesResponse.ok) {
                    throw new Error('Gagal mengambil data kategori');
                }
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter announcements based on search term and category
    const filteredAnnouncements = announcements.filter(item => {
        if (!item) return false;
        const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory === 'Semua' ||
            item.category?.category_name === selectedCategory;
        return titleMatch && categoryMatch;
    });

    // Helper function to get ID
    const getItemId = (item) => {
        if (!item) return null;
        return item.announcement_id || item.id;
    };

    // Helper function for file type detection and proper display
    const renderFilePreview = (item) => {
        if (!item || (!item.file && !item.image)) {
            return (
                <div className="flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg h-full w-full">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-1 text-xs">Tidak ada file</span>
                </div>
            );
        }

        const filePath = item.file || item.image;
        if (!filePath) {
            return (
                <div className="flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg h-full w-full">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-1 text-xs">Tidak ada file</span>
                </div>
            );
        }

        if (filePath.toLowerCase().endsWith('.pdf')) {
            return (
                <a
                    href={`/storage/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center h-full text-red-500 hover:text-red-600 transition-colors duration-200 bg-red-50 rounded-lg"
                >
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-1 text-xs font-medium">PDF</span>
                </a>
            );
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const isImage = imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
        if (isImage) {
            return (
                <div className="relative overflow-hidden rounded-lg h-full w-full bg-gray-50">
                    <img
                        src={`/storage/${filePath}`}
                        alt={item?.title || 'Gambar pengumuman'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.outerHTML = `
                                <div class="flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg h-full w-full">
                                    <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="mt-1 text-xs">Gambar gagal dimuat</span>
                                </div>
                            `;
                        }}
                    />
                </div>
            );
        }

        return (
            <a
                href={`/storage/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full text-blue-500 hover:text-blue-600 transition-colors duration-200 bg-blue-50 rounded-lg"
            >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="mt-1 text-xs font-medium">File</span>
            </a>
        );
    };

    // Function to get tag based on creatorRole
    const getTitleWithTag = (title, creatorRole) => {
        let tag = '';
        let tagColor = '#000000'; // Default black color for title
        switch (creatorRole) {
            case 'kemahasiswaan':
                tag = '[KEMAHASISWAAN] ';
                tagColor = '#F54243';
                break;
            case 'adminbem':
                tag = '[BEM] ';
                tagColor = '#22A7F4';
                break;
            case 'adminmpm':
                tag = '[MPM] ';
                tagColor = '#E7E73E';
                break;
            default:
                tag = '';
        }
        return (
            <span>
                <span style={{ color: tagColor, fontWeight: '700' }}>{tag}</span>
                <span>{title || 'Tanpa Judul'}</span>
            </span>
        );
    };

    // Format date from API
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
};

    return (
        <GuestLayout>
            <Navbar />
            <Head title="Pengumuman" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search, Filter and View Toggle Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                                    placeholder="Cari pengumuman..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>
                                <select
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none transition-all text-gray-900"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="Semua">Semua Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.category_id} value={category.category_name}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* View Toggle Buttons */}
                            <div className="flex items-center justify-center md:justify-end">
                                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center justify-center p-2 rounded-md transition-all ${viewMode === 'grid'
                                                ? 'bg-blue-500 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex items-center justify-center p-2 rounded-md transition-all ${viewMode === 'list'
                                                ? 'bg-blue-500 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full absolute border-4 border-gray-200"></div>
                                <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Content Grid/List */}
                            {filteredAnnouncements.length > 0 ? (
                                viewMode === 'grid' ? (
                                    // Grid View
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredAnnouncements.map((item) => {
                                            const itemId = getItemId(item);
                                            if (!itemId) return null;

                                            return (
                                                <Link
                                                    key={itemId}
                                                    href={`/announcement/${itemId}`}
                                                    className="group block"
                                                >
                                                    <div className="h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                                                        <div className="h-48 overflow-hidden">
                                                            {renderFilePreview(item)}
                                                        </div>

                                                        <div className="p-5">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                                    {item.category?.category_name || "Uncategorized"}
                                                                </span>

                                                                <span className="text-xs text-gray-500">
                                                                    {formatDate(item.created_at)}
                                                                </span>
                                                            </div>

                                                            <h2 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                {getTitleWithTag(item.title, item.created_by?.role)}
                                                            </h2>

                                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                                {(item.content || '').replace(/<[^>]+>/g, '').substring(0, 120) + '...'}
                                                            </p>

                                                            <div className="flex justify-end">
                                                                <span className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                                                                    Baca Selengkapnya
                                                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // List View - dengan spacing yang lebih baik
                                    <div className="space-y-6">
                                        {filteredAnnouncements.map((item, index) => {
                                            const itemId = getItemId(item);
                                            if (!itemId) return null;

                                            return (
                                                <div key={itemId} className="mb-6">
                                                    <Link
                                                        href={`/announcement/${itemId}`}
                                                        className="group block"
                                                    >
                                                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                                                            <div className="flex flex-col lg:flex-row">
                                                                <div className="lg:w-80 lg:flex-shrink-0 h-52 lg:h-auto">
                                                                    {renderFilePreview(item)}
                                                                </div>

                                                                <div className="p-6 flex-1 lg:p-8">
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                                                                            {item.category?.category_name || "Uncategorized"}
                                                                        </span>

                                                                        <span className="text-sm text-gray-500">
                                                                            {formatDate(item.created_at)}
                                                                        </span>
                                                                    </div>

                                                                    <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                                                                        {getTitleWithTag(item.title, item.created_by?.role)}
                                                                    </h2>

                                                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                                                        {(item.content || '').replace(/<[^>]+>/g, '').substring(0, 200) + '...'}
                                                                    </p>

                                                                    <div className="flex justify-end">
                                                                        <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                                                                            Baca Selengkapnya
                                                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                            </svg>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    
                                                    {/* Divider line between items, except for the last item */}
                                                    {index < filteredAnnouncements.length - 1 && (
                                                        <div className="mt-6 border-b border-gray-100"></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Tidak ada pengumuman
                                    </h3>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        {searchTerm
                                            ? "Tidak ada hasil yang cocok dengan pencarian Anda. Coba ubah kata kunci atau pilih kategori lain."
                                            : "Belum ada pengumuman yang ditambahkan. Silakan periksa kembali nanti."
                                        }
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