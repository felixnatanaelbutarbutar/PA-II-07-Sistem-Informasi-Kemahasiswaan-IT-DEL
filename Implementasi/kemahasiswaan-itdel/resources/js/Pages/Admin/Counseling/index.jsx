import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CounselingIndex({ auth, counselings, userRole, permissions, menu }) {
    const { flash } = usePage().props;
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState({});
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedCounselingId, setSelectedCounselingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State untuk pencarian
    const [sortOrder, setSortOrder] = useState('desc'); // State untuk filter terlama/terbaru

    console.log("User Role di AdminLayout:", userRole);
    console.log('Counselings Data:', counselings);
    console.log("Flash message:", flash);

    // Format nomor WhatsApp
    const formatWhatsAppNumber = (number) => {
        let formattedNumber = number.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.slice(1);
        } else if (!formattedNumber.startsWith('62')) {
            formattedNumber = '62' + formattedNumber;
        }
        return formattedNumber;
    };

    // Handle status change dan kirim pesan WhatsApp jika disetujui atau ditolak
    const handleStatusChange = (counselingId, newStatus, rejectionReason = null) => {
        setStatusUpdating((prev) => ({ ...prev, [counselingId]: true }));
        const counseling = counselings.data.find((c) => c.id === counselingId);
        const dataToSend = { status: newStatus };
        if (newStatus === 'ditolak' && rejectionReason) {
            dataToSend.rejection_reason = rejectionReason;
        }

        router.post(
            route('admin.counseling.update', counselingId),
            dataToSend,
            {
                onSuccess: () => {
                    router.visit(route('admin.counseling.index'), {
                        preserveState: true,
                        preserveScroll: true,
                    });
                    if (newStatus === 'disetujui' && counseling) {
                        const formattedDate = new Date(counseling.booking_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        });
                        const message = `Halo, ${counseling.user.nim} | ${counseling.user.name}\nPengajuan jadwal konseling kamu sudah disetujui, yaitu pada tanggal ${formattedDate} jam ${counseling.booking_time}.\n\nHarap hadir di ruangan konseling 10 mnt sebelum jam tersebut\nSalam`;
                        const encodedMessage = encodeURIComponent(message);
                        const phoneNumber = formatWhatsAppNumber(counseling.noWhatsApp);
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
                        window.open(whatsappUrl, '_blank');
                    }
                    if (newStatus === 'ditolak' && counseling && rejectionReason) {
                        const message = `Halo, ${counseling.user.nim} | ${counseling.user.name}\nPermintaan konseling Anda ditolak dengan alasan: ${rejectionReason}\nSalam`;
                        const encodedMessage = encodeURIComponent(message);
                        const phoneNumber = formatWhatsAppNumber(counseling.noWhatsApp);
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
                        window.open(whatsappUrl, '_blank');
                    }
                },
                onFinish: () => {
                    setStatusUpdating((prev) => ({ ...prev, [counselingId]: false }));
                    setShowRejectionModal(false);
                    setRejectionReason('');
                    setSelectedCounselingId(null);
                },
                onError: (errors) => {
                    console.error('Error updating status:', errors);
                    setNotificationMessage({ type: 'error', message: 'Gagal memperbarui status.' });
                    setShowNotification(true);
                },
            }
        );
    };

    // Handle rejection button click
    const handleRejectionClick = (counselingId) => {
        setSelectedCounselingId(counselingId);
        setShowRejectionModal(true);
    };

    // Handle rejection form submission
    const handleRejectionSubmit = () => {
        if (!rejectionReason.trim()) {
            setNotificationMessage({ type: 'error', message: 'Alasan penolakan wajib diisi.' });
            setShowNotification(true);
            return;
        }
        handleStatusChange(selectedCounselingId, 'ditolak', rejectionReason);
    };

    // Show notification based on flash message
    useEffect(() => {
        if (flash?.success) {
            setNotificationMessage({ type: 'success', message: flash.success });
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Fungsi untuk menyaring dan menyortir data
    const filteredCounselings = counselings.data
        .filter((counseling) =>
            [
                counseling.user.nim || '',
                counseling.user.name || '',
                counseling.user.asrama || '',
                counseling.issue || '',
                counseling.noWhatsApp || '',
            ].some((field) =>
                field.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Manajemen Permintaan Konseling - Kemahasiswaan IT Del" />

            {/* Notification */}
            {showNotification && notificationMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notificationMessage.type === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notificationMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notificationMessage.type === 'success' ? (
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                ) : (
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V5z"
                                        clipRule="evenodd"
                                    />
                                )}
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p
                                className={`text-sm font-medium ${
                                    notificationMessage.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notificationMessage.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notificationMessage.type === 'success'
                                        ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                                        : 'text-rose-500 hover:bg-rose-100 focus:ring-rose-500'
                                } focus:outline-none focus:ring-2`}
                            >
                                <span className="sr-only">Dismiss</span>
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

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Alasan Penolakan</h3>
                        <p className="text-gray-600 text-center mb-4">Masukkan alasan mengapa permintaan konseling ini ditolak.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Masukkan alasan penolakan..."
                            rows="4"
                        />
                        <div className="flex justify-center space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason('');
                                    setSelectedCounselingId(null);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRejectionSubmit}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Tolak
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Manajemen Permintaan Konseling
                            </h1>
                            <p className="text-gray-500 mt-1">Kelola permintaan konseling dari mahasiswa</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari permintaan konseling..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 transition-all duration-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <option value="desc">Terbaru</option>
                                    <option value="asc">Terlama</option>
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
                        </div>
                    </div>
                </div>

                {filteredCounselings.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        NIM
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Asrama
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Masalah
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Nomor WhatsApp
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Tanggal Booking
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Jam Booking
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Tanggal Pengajuan
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Alasan Penolakan
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCounselings.map((counseling) => (
                                    <tr key={counseling.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-4 text-sm font-medium text-gray-900 max-w-[100px] break-words">
                                            {counseling.user.nim || '-'}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[120px] break-words">
                                            {counseling.user.name}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[100px] break-words">
                                            {counseling.user.asrama || '-'}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[150px] break-words">
                                            {counseling.issue}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[120px] break-words">
                                            {counseling.noWhatsApp}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[120px] break-words">
                                            {new Date(counseling.booking_date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[80px] break-words">
                                            {counseling.booking_time}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[120px] break-words">
                                            {new Date(counseling.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-3 py-4 text-sm font-medium max-w-[120px] break-words">
                                            <span
                                                className={`${
                                                    counseling.status === 'menunggu'
                                                        ? 'text-orange-600'
                                                        : counseling.status === 'disetujui'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {counseling.status === 'menunggu'
                                                    ? 'Menunggu Persetujuan'
                                                    : counseling.status === 'disetujui'
                                                    ? 'Disetujui'
                                                    : 'Ditolak'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-600 max-w-[150px] break-words">
                                            {counseling.rejection_reason || '-'}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {counseling.status !== 'disetujui' && (
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(counseling.id, 'disetujui')
                                                    }
                                                    disabled={statusUpdating[counseling.id]}
                                                    className={`text-green-600 hover:text-green-700 mr-2 transition ${
                                                        statusUpdating[counseling.id] ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    Setujui
                                                </button>
                                            )}
                                            {counseling.status !== 'ditolak' && (
                                                <button
                                                    onClick={() => handleRejectionClick(counseling.id)}
                                                    disabled={statusUpdating[counseling.id]}
                                                    className={`text-red-600 hover:text-red-700 transition ${
                                                        statusUpdating[counseling.id] ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    Tolak
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination Links */}
                        {counselings.links && (
                            <div className="px-6 py-4 flex justify-center">
                                {counselings.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1 mx-1 rounded text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
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
                                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m-3 6h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada permintaan konseling'}
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {searchQuery
                                ? 'Tidak ada permintaan konseling yang cocok dengan pencarian Anda.'
                                : 'Tidak ada permintaan konseling yang tersedia saat ini.'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
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
                        )}
                    </div>
                )}
            </div>

            {/* Animation Styles */}
            <style>
                {`
                    @keyframes slide-in-right {
                        0% {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        100% {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    .animate-slide-in-right {
                        animation: slide-in-right 0.5s ease-out forwards;
                    }
                `}
            </style>
        </AdminLayout>
    );
}