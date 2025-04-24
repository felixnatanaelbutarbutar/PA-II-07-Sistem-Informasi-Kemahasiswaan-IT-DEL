import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PlusCircle, Edit, Trash2, Download, Calendar } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function ActivityCalendar({ auth, userRole, permissions, menu, activities }) {
    const events = useMemo(() => {
        return activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            start: new Date(activity.start_date),
            end: activity.end_date ? new Date(activity.end_date) : new Date(activity.start_date),
            description: activity.description,
        }));
    }, [activities]);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
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

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Kalender Kegiatan" />

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
                                    <Link
                                        href={route('admin.activities.destroy', selectedEvent.id)}
                                        method="post"
                                        as="button"
                                        className={`flex items-center px-3 py-1 rounded-full
                                            ${document.documentElement.classList.contains('light') ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-red-900 text-red-300 hover:bg-red-800' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-red-200 text-red-900 hover:bg-red-300' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-red-800 text-red-200 hover:bg-red-700' : ''}`}>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Hapus
                                    </Link>
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
        </AdminLayout>
    );
}