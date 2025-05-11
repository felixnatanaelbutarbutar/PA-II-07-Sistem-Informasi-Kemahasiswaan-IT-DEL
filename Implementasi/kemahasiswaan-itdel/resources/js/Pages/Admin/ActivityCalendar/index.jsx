import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PlusCircle, Edit, Trash2, Download, Calendar } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function ActivityCalendar({ auth, userRole, permissions, menu, activities }) {
    const { flash } = usePage().props ?? {};
    const events = useMemo(() => {
        return activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            start: new Date(activity.start_date),
            end: activity.end_date ? new Date(activity.end_date) : new Date(activity.start_date),
            description: activity.description,
            creatorRole: activity.creator?.role.toLowerCase(), // Ambil role pembuat kegiatan
        }));
    }, [activities]);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activityIdToDelete, setActivityIdToDelete] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    useEffect(() => {
        if (flash) {
            if (flash.success) {
                setNotificationMessage(flash.success);
                setNotificationType('success');
                setShowNotification(true);
            } else if (flash.error) {
                setNotificationMessage(flash.error);
                setNotificationType('error');
                setShowNotification(true);
            }
        }

        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    const handleDeleteClick = (activityId) => {
        setActivityIdToDelete(activityId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (activityIdToDelete) {
            router.post(route('admin.activities.destroy', activityIdToDelete), {}, {
                onSuccess: () => {
                    setNotificationMessage('Kegiatan berhasil dihapus!');
                    setNotificationType('success');
                    setShowNotification(true);
                    setSelectedEvent(null);
                },
                onError: (errors) => {
                    setNotificationMessage('Gagal menghapus kegiatan: ' + (errors.error || 'Terjadi kesalahan.'));
                    setNotificationType('error');
                    setShowNotification(true);
                },
                onFinish: () => {
                    setShowDeleteModal(false);
                    setActivityIdToDelete(null);
                },
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setActivityIdToDelete(null);
    };

    const handleExportPDF = () => {
        if (!startDate || !endDate) {
            alert('Harap pilih rentang tanggal terlebih dahulu!');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Tanggal mulai harus lebih awal dari tanggal selesai!');
            return;
        }
        setIsModalOpen(false);
    };

    const exportUrl = startDate && endDate 
        ? `${route('admin.activities.export.pdf')}?start_date=${startDate}&end_date=${endDate}`
        : route('admin.activities.export.pdf');

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = '#F54243'; // Kemahasiswaan
        if (event.creatorRole === 'adminbem') backgroundColor = '#22A7F4'; // Admin BEM
        if (event.creatorRole === 'adminmpm') backgroundColor = '#E7E73E'; // Admin MPM

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'black',
                border: 'none',
                display: 'block',
            },
        };
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Kalender Kegiatan" />

            {/* Notifikasi */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notificationType === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notificationType === 'success' ? (
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
                                    notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notificationMessage}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notificationType === 'success'
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

            {/* Modal Konfirmasi Penghapusan */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className={`bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100
                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-200' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-200' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-800' : ''}`}>
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className={`text-lg font-semibold text-center mb-2
                            ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                            Konfirmasi Penghapusan
                        </h3>
                        <p className={`text-center mb-6
                            ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                            Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelDelete}
                                className={`px-4 py-2 rounded-lg
                                    ${document.documentElement.classList.contains('light') ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-zinc-600 text-gray-200 hover:bg-zinc-500' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : ''}`}>
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className={`flex items-center px-4 py-2 rounded-lg
                                    ${document.documentElement.classList.contains('light') ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-red-700 text-white hover:bg-red-800' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-red-800 text-white hover:bg-red-900' : ''}`}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className={`backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border
                        ${document.documentElement.classList.contains('light') ? 'bg-white/80 border-gray-200/50' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800/80 border-zinc-700/50' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50/80 border-blue-200/50' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950/80 border-blue-800/50' : ''}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className={`text-3xl font-bold bg-clip-text text-transparent
                                    ${document.documentElement.classList.contains('light') ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-gradient-to-r from-blue-300 to-indigo-400' : ''}`}>
                                    Kalender Kegiatan
                                </h1>
                                <p className={`mt-1
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-500' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                    Kelola jadwal kegiatan Anda di sini
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className={`flex items-center px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                        ${document.documentElement.classList.contains('light') ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-green-400 text-white hover:bg-green-500' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-green-700 text-white hover:bg-green-800' : ''}`}>
                                    <Download className="h-5 w-5 mr-2" />
                                    Ekspor ke PDF
                                </button>
                                <Link
                                    href={route('admin.activities.create')}
                                    className={`flex items-center px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                        ${document.documentElement.classList.contains('light') ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-400 text-white hover:bg-blue-500' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}>
                                    <PlusCircle className="h-5 w-5 mr-2" />
                                    Tambah Kegiatan
                                </Link>
                            </div>
                        </div>

                        {/* Color Guide */}
                        <div className="mt-6">
                            <h3 className={`text-lg font-semibold mb-3
                                ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                Panduan Warna Kegiatan
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md
                                    bg-opacity-80 hover:bg-opacity-100
                                    ${document.documentElement.classList.contains('light') ? 'bg-gray-50' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900' : ''}">
                                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#F54243' }}></div>
                                    <span className={`text-sm
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-300' : ''}`}>
                                        Kegiatan dari Kemahasiswaan
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md
                                    bg-opacity-80 hover:bg-opacity-100
                                    ${document.documentElement.classList.contains('light') ? 'bg-gray-50' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900' : ''}">
                                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#22A7F4' }}></div>
                                    <span className={`text-sm
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-300' : ''}`}>
                                        Kegiatan dari Admin BEM
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md
                                    bg-opacity-80 hover:bg-opacity-100
                                    ${document.documentElement.classList.contains('light') ? 'bg-gray-50' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900' : ''}">
                                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#E7E73E' }}></div>
                                    <span className={`text-sm
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-300' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-300' : ''}`}>
                                        Kegiatan dari Admin MPM
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal untuk memilih rentang tanggal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className={`p-6 rounded-lg shadow-lg max-w-md w-full
                                ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-200' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-200' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-800' : ''}`}>
                                <h2 className={`text-xl font-semibold mb-4
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                    Pilih Rentang Tanggal
                                </h2>
                                <div className="mb-4">
                                    <label className={`block mb-1
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={`w-full p-2 rounded-md border
                                            ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 text-gray-800' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 text-gray-200' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100 border-blue-300 text-blue-800' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 text-blue-200' : ''}`}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block mb-1
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                        Tanggal Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={`w-full p-2 rounded-md border
                                            ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-300 text-gray-800' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-700 border-zinc-600 text-gray-200' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100 border-blue-300 text-blue-800' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-900 border-blue-700 text-blue-200' : ''}`}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className={`px-4 py-2 rounded-md
                                            ${document.documentElement.classList.contains('light') ? 'bg-gray-300 text-gray-800 hover:bg-gray-400' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-600 text-gray-200 hover:bg-zinc-500' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : ''}`}>
                                        Batal
                                    </button>
                                    <a
                                        href={exportUrl}
                                        onClick={handleExportPDF}
                                        className={`flex items-center px-4 py-2 rounded-md
                                            ${document.documentElement.classList.contains('light') ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-green-400 text-white hover:bg-green-500' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-green-700 text-white hover:bg-green-800' : ''}`}
                                        download
                                    >
                                        <Download className="h-5 w-5 mr-2" />
                                        Ekspor
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Kalender */}
                    <div className={`rounded-xl shadow-sm p-6
                        ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-200/50' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700/50' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-200/50' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-800/50' : ''}`}>
                        <BigCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            className="rbc-calendar-custom"
                        />
                    </div>

                    {/* Detail Kegiatan */}
                    {selectedEvent && (
                        <div className={`mt-6 p-6 rounded-xl shadow-sm border
                            ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-200/50' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-200/50' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-800/50' : ''}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-medium
                                    ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                    {selectedEvent.title}
                                </h3>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('admin.activities.edit', selectedEvent.id)}
                                        className={`flex items-center px-3 py-1 rounded-full
                                            ${document.documentElement.classList.contains('light') ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-200 text-blue-900 hover:bg-blue-300' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : ''}`}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteClick(selectedEvent.id)}
                                        className={`flex items-center px-3 py-1 rounded-full
                                            ${document.documentElement.classList.contains('light') ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-red-900 text-red-300 hover:bg-red-800' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-red-200 text-red-900 hover:bg-red-300' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-red-800 text-red-200 hover:bg-red-700' : ''}`}>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                            <p className={`text-sm
                                ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                Deskripsi: {selectedEvent.description || 'Tidak ada deskripsi.'}
                            </p>
                            <p className={`text-sm mt-2
                                ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                Tanggal Mulai: {moment(selectedEvent.start).format('DD MMMM YYYY')}
                            </p>
                            <p className={`text-sm mt-2
                                ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                Tanggal Selesai: {selectedEvent.end ? moment(selectedEvent.end).format('DD MMMM YYYY') : 'Sama dengan tanggal mulai'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

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