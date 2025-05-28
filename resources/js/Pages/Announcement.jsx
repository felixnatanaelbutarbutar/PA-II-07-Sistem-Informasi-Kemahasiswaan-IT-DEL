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
    const [metaData, setMetaData] = useState(null); // State untuk data meta
    const [metaError, setMetaError] = useState(null); // State untuk error meta

    // Fetch data from API when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get announcements list
                const announcementsResponse = await fetch('/api/announcements');
                if (!announcementsResponse.ok) {
                    throw new Error('Gagal mengambil data pengumuman');
                }
                const announcementsData = await announcementsResponse.json();
                setAnnouncements(announcementsData.data || []);

                // Get categories list
                const categoriesResponse = await fetch('/api/announcement-categories');
                if (!categoriesResponse.ok) {
                    throw new Error('Gagal mengambil data kategori');
                }
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Get meta data
                const metaResponse = await fetch('/api/meta/pengumuman');
                if (!metaResponse.ok) {
                    throw new Error('Gagal mengambil data meta pengumuman');
                }
                const metaData = await metaResponse.json();
                setMetaData(metaData);
            } catch (err) {
                setError(err.message);
                if (err.message.includes('meta')) setMetaError(err.message);
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

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Meta Section - Enhanced */}
                    <div className="mb-8">
                        {metaError ? (
                            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-red-800">{metaError}</p>
                                    </div>
                                </div>
                            </div>
                        ) : metaData ? (
                            <div className="relative bg-gradient-to-r from-white via-blue-50/30 to-white p-8 rounded-2xl shadow-lg border border-gray-200/50 text-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                                        {metaData.meta_title || 'Pengumuman'}
                                    </h1>
                                    <div
                                        className="text-gray-600 leading-relaxed prose prose-sm max-w-2xl mx-auto"
                                        dangerouslySetInnerHTML={{ __html: metaData.meta_description || 'Informasi terbaru mengenai pengumuman dari institusi.' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 text-center">
                                <div className="animate-pulse">
                                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search, Filter and View Toggle Section - Enhanced */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-gray-200/50">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-gray-900 placeholder-gray-500 bg-white/70 backdrop-blur-sm font-medium"
                                    placeholder="Cari pengumuman..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                        <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                    </div>
                                </div>
                                <select
                                    className="block w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none transition-all text-gray-900 bg-white/70 backdrop-blur-sm font-medium"
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
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* View Toggle Buttons - Enhanced */}
                            <div className="flex items-center justify-center md:justify-end">
                                <div className="inline-flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex items-center justify-center p-3 rounded-lg transition-all duration-300 ${viewMode === 'list'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
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

                    {/* Error Message - Enhanced */}
                    {error && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-6 mb-6 rounded-2xl shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State - Enhanced */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full absolute border-4 border-gray-200"></div>
                                <div className="w-16 h-16 rounded-full animate-spin absolute border-4 border-transparent border-t-blue-500 border-r-blue-500"></div>
                                <div className="w-12 h-12 rounded-full absolute top-2 left-2 border-4 border-transparent border-t-blue-300 border-r-blue-300 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Content Grid/List - Enhanced */}
                            {filteredAnnouncements.length > 0 ? (
                                viewMode === 'grid' ? (
                                    // Grid View - Enhanced
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
                                                    <div className="h-full bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-200/50 relative group">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                        
                                                        <div className="relative z-10 p-6">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 shadow-sm">
                                                                    {item.category?.category_name || "Uncategorized"}
                                                                </span>

                                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                                    {formatDate(item.created_at)}
                                                                </span>
                                                            </div>

                                                            <h2 className="text-lg font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                                                {getTitleWithTag(item.title, item.created_by?.role)}
                                                            </h2>

                                                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                                                {(item.content || '').replace(/<[^>]+>/g, '').substring(0, 120) + '...'}
                                                            </p>

                                                            <div className="flex justify-end">
                                                                <span className="inline-flex items-center text-blue-600 text-sm font-bold group-hover:text-blue-700 transition-all duration-300 bg-blue-50 px-3 py-2 rounded-lg group-hover:bg-blue-100">
                                                                    Baca Selengkapnya
                                                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    // List View - Enhanced dengan spacing yang dikurangi
                                    <div className="space-y-4">
                                        {filteredAnnouncements.map((item, index) => {
                                            const itemId = getItemId(item);
                                            if (!itemId) return null;

                                            return (
                                                <Link
                                                    key={itemId}
                                                    href={`/announcement/${itemId}`}
                                                    className="group block"
                                                >
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200/50 relative group">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                        
                                                        <div className="relative z-10 flex flex-col lg:flex-row">
                                                            <div className="p-6 flex-1 lg:p-8">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <span className="px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 shadow-sm">
                                                                        {item.category?.category_name || "Uncategorized"}
                                                                    </span>

                                                                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
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
                                                                    <span className="inline-flex items-center text-blue-600 font-bold group-hover:text-blue-700 transition-all duration-300 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200">
                                                                        Baca Selengkapnya
                                                                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                // Empty State - Enhanced
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-200/50 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-blue-50/30"></div>
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 mb-6 shadow-inner">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                            Tidak ada pengumuman
                                        </h3>
                                        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                                            {searchTerm
                                                ? "Tidak ada hasil yang cocok dengan pencarian Anda. Coba ubah kata kunci atau pilih kategori lain."
                                                : "Belum ada pengumuman yang ditambahkan. Silakan periksa kembali nanti."
                                            }
                                        </p>
                                    </div>
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