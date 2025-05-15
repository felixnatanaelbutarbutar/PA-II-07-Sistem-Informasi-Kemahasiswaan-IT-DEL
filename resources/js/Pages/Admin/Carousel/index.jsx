import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CarouselIndex({ auth, userRole, permissions, menu, carousels = [] }) {
    const { flash } = usePage().props ?? {};
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isGridView, setIsGridView] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null);

    // Handle flash messages for notifications
    useEffect(() => {
        if (flash && flash.success) {
            setNotificationMessage(flash.success);
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Filter and sort carousels
    const filteredCarousels = carousels
        .filter(
            (item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => (sortOrder === 'asc' ? a.order - b.order : b.order - a.order));

    // Handle delete action with POST
    const handleDelete = (carouselId) => {
        if (confirm('Apakah Anda yakin ingin menghapus carousel ini?')) {
            setIsDeleting(carouselId);
            router.post(
                route('admin.carousel.destroy', carouselId),
                {},
                {
                    onFinish: () => setIsDeleting(null),
                    preserveScroll: true,
                }
            );
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Kelola Carousel" />

            {/* Notification */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50 max-w-md bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-emerald-500 px-6 py-4 rounded-lg shadow-xl transition-all duration-300 transform animate-slide-in-right">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-emerald-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-emerald-800">{notificationMessage}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className="inline-flex rounded-md p-1.5 text-emerald-500 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Manajemen Carousel
                            </h1>
                            <p className="text-gray-600 mt-1">Kelola carousel untuk halaman utama website</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari carousel..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 transition-all duration-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg
                                    className="w-5 h-5 absolute left-3 top-3 text-gray-400"
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

                            {/* Sort Dropdown */}
                            <div className="relative w-full sm:w-40">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300"
                                >
                                    <option value="asc">Urutan Naik</option>
                                    <option value="desc">Urutan Turun</option>
                                </select>
                                <svg
                                    className="w-5 h-5 absolute right-3 top-3 text-gray-400 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setIsGridView(true)}
                                    className={`p-2 rounded-md ${
                                        isGridView
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    } transition-all duration-200`}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsGridView(false)}
                                    className={`p-2 rounded-md ${
                                        !isGridView
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    } transition-all duration-200`}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Add New Carousel Button */}
                            <Link
                                href={route('admin.carousel.create')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Carousel
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                {isGridView ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCarousels.map((carousel) => (
                            <div
                                key={carousel.carousel_id}
                                className="group bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                            >
                                <div className="p-5 flex flex-col flex-grow">
                                    {/* Carousel Image */}
                                    <div className="relative mb-4">
                                        {carousel.image_path.endsWith('.svg') ? (
                                            <object
                                                data={`/storage/${carousel.image_path}`}
                                                type="image/svg+xml"
                                                className="w-full h-48 object-cover rounded-lg"
                                            >
                                                <img
                                                    src={`/storage/${carousel.image_path}`}
                                                    alt={carousel.title}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </object>
                                        ) : (
                                            <img
                                                src={`/storage/${carousel.image_path}`}
                                                alt={carousel.title}
                                                className="w-full h-48 object-cover rounded-lg"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>

                                    {/* Carousel Details */}
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                                        {carousel.title}
                                    </h2>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium text-gray-700">ID:</span>{' '}
                                            <span className="text-gray-600">{carousel.carousel_id}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-700">Deskripsi:</span>{' '}
                                            <span className="text-gray-600">{carousel.description || 'Tidak Ada'}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-700">Urutan:</span>{' '}
                                            <span className="text-gray-600">{carousel.order}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-700">Status:</span>{' '}
                                            <span className="text-gray-600">{carousel.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-700">Dibuat Pada:</span>{' '}
                                            <span className="text-gray-600">
                                                {new Date(carousel.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 flex space-x-3">
                                        <Link
                                            href={route('admin.carousel.edit', carousel.carousel_id)}
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 group-hover:scale-105 shadow-sm hover:shadow-md"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(carousel.carousel_id)}
                                            disabled={isDeleting === carousel.carousel_id}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 group-hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeleting === carousel.carousel_id ? (
                                                <svg
                                                    className="w-4 h-4 mr-2 animate-spin"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            )}
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        {filteredCarousels.map((carousel, index) => (
                            <div
                                key={carousel.carousel_id}
                                className={`flex flex-col sm:flex-row items-start p-5 hover:bg-gray-50 transition-colors duration-200 ${
                                    index !== filteredCarousels.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                            >
                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                        <div className="flex-grow flex items-start space-x-4">
                                            {/* Carousel Image */}
                                            <div className="relative w-32 h-20">
                                                {carousel.image_path.endsWith('.svg') ? (
                                                    <object
                                                        data={`/storage/${carousel.image_path}`}
                                                        type="image/svg+xml"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    >
                                                        <img
                                                            src={`/storage/${carousel.image_path}`}
                                                            alt={carousel.title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    </object>
                                                ) : (
                                                    <img
                                                        src={`/storage/${carousel.image_path}`}
                                                        alt={carousel.title}
                                                        className="w-full h-full object-cover rounded-lg"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200 mb-2">
                                                    {carousel.title}
                                                </h2>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium text-gray-700">ID:</span>{' '}
                                                        <span className="text-gray-600">{carousel.carousel_id}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-gray-700">Deskripsi:</span>{' '}
                                                        <span className="text-gray-600">{carousel.description || 'Tidak Ada'}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-gray-700">Urutan:</span>{' '}
                                                        <span className="text-gray-600">{carousel.order}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-gray-700">Status:</span>{' '}
                                                        <span className="text-gray-600">{carousel.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-gray-700">Dibuat Pada:</span>{' '}
                                                        <span className="text-gray-600">
                                                            {new Date(carousel.created_at).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col space-x-3 sm:space-x-0 sm:space-y-2 mt-4 sm:mt-0">
                                            <Link
                                                href={route('admin.carousel.edit', carousel.carousel_id)}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(carousel.carousel_id)}
                                                disabled={isDeleting === carousel.carousel_id}
                                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isDeleting === carousel.carousel_id ? (
                                                    <svg
                                                        className="w-4 h-4 mr-2 animate-spin"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                )}
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredCarousels.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Tidak ada carousel yang tersedia
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {searchTerm
                                ? 'Tidak ada hasil yang cocok dengan pencarian Anda'
                                : 'Silahkan tambahkan carousel baru untuk mulai mengisi konten website Anda'}
                        </p>
                        {searchTerm ? (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Reset Pencarian
                            </button>
                        ) : (
                            <Link
                                href={route('admin.carousel.create')}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Carousel Baru
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}