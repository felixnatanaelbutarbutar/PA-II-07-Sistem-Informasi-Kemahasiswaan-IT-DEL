import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import * as XLSX from 'xlsx';
import moment from 'moment';

// Main component for managing form responses
export default function Responses({ auth, userRole, permissions, form, submissions = [], menu, flash }) {
    // State for search, sorting, notifications, dropdown, and export options
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [viewMode, setViewMode] = useState('table');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showExportOptions, setShowExportOptions] = useState(false);

    // Create refs for each dropdown
    const dropdownRefs = useRef({});

    // Handle flash messages for success/error notifications
    useEffect(() => {
        if (flash?.success) {
            setNotificationMessage(flash.success);
            setNotificationType('success');
            setShowNotification(true);
        } else if (flash?.error) {
            setNotificationMessage(flash.error);
            setNotificationType('error');
            setShowNotification(true);
        }

        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Handle click outside to close dropdown and Escape key press
    useEffect(() => {
        const handleClickOutside = (event) => {
            let isOutside = true;
            Object.values(dropdownRefs.current).forEach((ref) => {
                if (ref && ref.contains(event.target)) {
                    isOutside = false;
                }
            });
            if (isOutside) {
                setOpenDropdownId(null);
                setShowExportOptions(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpenDropdownId(null);
                setShowExportOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Debounce search updates to refresh the table
    useEffect(() => {
        const timer = setTimeout(() => {
            const queryParams = {
                search: searchTerm.trim() || undefined,
                sort_by: sortBy || undefined,
                sort_direction: sortDirection || undefined,
            };

            router.get(
                route('admin.form.responses', form.form_id),
                queryParams,
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, sortBy, sortDirection]);

    // Fungsi untuk mengambil jawaban dari data
    const getFormAnswers = (data) => {
        const answers = {};
        for (const key in data) {
            const match = key.match(/sections\..+\.fields\.(\d+)/);
            if (match) {
                const order = match[1];
                answers['Jawaban ' + order] = data[key];
            }
        }
        return answers;
    };

    // Fungsi untuk mengambil data CIS (placeholder, ganti dengan API nyata)
    const getCISData = async (userId) => {
        return {
            address: 'Alamat ' + userId,
            birth_date: '1990-01-01',
            phone: '0812' + userId.toString().padStart(8, '0'),
        };
    };

    // Fungsi ekspor Excel untuk Opsi 1 (Nama, NIM, Jawaban)
    const exportToExcelOption1 = () => {
        if (!submissions || submissions.length === 0) {
            setNotificationMessage('Tidak ada data untuk diekspor.');
            setNotificationType('error');
            setShowNotification(true);
            return;
        }

        const wb = XLSX.utils.book_new();
        const firstSubmissionData = submissions[0]?.data || {};
        const answerHeaders = Object.keys(getFormAnswers(firstSubmissionData)).map((k, i) => 'Jawaban ' + (i + 1));
        const wsData = [
            ['No', 'Nama', 'NIM', 'Tanggal Pengajuan', ...answerHeaders],
        ];

        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];
            const answers = getFormAnswers(submission.data);
            wsData.push([
                i + 1,
                submission.user.name,
                submission.user.nim,
                submission.submitted_at,
                ...Object.values(answers),
            ]);
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Respons Formulir');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbout;
        openInGoogleSheets(dataUri, 'Respons Formulir');
    };

    // Fungsi ekspor Excel untuk Opsi 2 (Full Data termasuk CIS)
    const exportToExcelOption2 = async () => {
        if (!submissions || submissions.length === 0) {
            setNotificationMessage('Tidak ada data untuk diekspor.');
            setNotificationType('error');
            setShowNotification(true);
            return;
        }

        const wb = XLSX.utils.book_new();
        const firstSubmissionData = submissions[0]?.data || {};
        const answerHeaders = Object.keys(getFormAnswers(firstSubmissionData)).map((k, i) => 'Jawaban ' + (i + 1));
        const wsData = [
            ['No', 'Nama', 'NIM', 'Email', 'Tanggal Pengajuan', 'Alamat', 'Tanggal Lahir', 'Telepon', ...answerHeaders],
        ];

        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];
            const answers = getFormAnswers(submission.data);
            const cisData = await getCISData(submission.user.id);
            wsData.push([
                i + 1,
                submission.user.name,
                submission.user.nim,
                submission.user.email,
                submission.submitted_at,
                cisData.address,
                cisData.birth_date,
                cisData.phone,
                ...Object.values(answers),
            ]);
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Respons Formulir Full');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbout;
        openInGoogleSheets(dataUri, 'Respons Formulir Full');
    };

    // Fungsi ekspor CSV untuk Opsi 1
    const exportToCSVOption1 = () => {
        if (!submissions || submissions.length === 0) {
            setNotificationMessage('Tidak ada data untuk diekspor.');
            setNotificationType('error');
            setShowNotification(true);
            return;
        }

        const firstSubmissionData = submissions[0]?.data || {};
        const answerHeaders = Object.keys(getFormAnswers(firstSubmissionData)).map((k, i) => 'Jawaban ' + (i + 1));
        const csvData = [
            ['No', 'Nama', 'NIM', 'Tanggal Pengajuan', ...answerHeaders].join(','),
        ];

        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];
            const answers = getFormAnswers(submission.data);
            csvData.push([
                i + 1,
                submission.user.name,
                submission.user.nim,
                submission.submitted_at,
                ...Object.values(answers),
            ].join(','));
        }

        const csvContent = csvData.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${form.form_name}_Respons_CSV_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Fungsi ekspor CSV untuk Opsi 2
    const exportToCSVOption2 = async () => {
        if (!submissions || submissions.length === 0) {
            setNotificationMessage('Tidak ada data untuk diekspor.');
            setNotificationType('error');
            setShowNotification(true);
            return;
        }

        const firstSubmissionData = submissions[0]?.data || {};
        const answerHeaders = Object.keys(getFormAnswers(firstSubmissionData)).map((k, i) => 'Jawaban ' + (i + 1));
        const csvData = [
            ['No', 'Nama', 'NIM', 'Email', 'Tanggal Pengajuan', 'Alamat', 'Tanggal Lahir', 'Telepon', ...answerHeaders].join(','),
        ];

        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];
            const answers = getFormAnswers(submission.data);
            const cisData = await getCISData(submission.user.id);
            csvData.push([
                i + 1,
                submission.user.name,
                submission.user.nim,
                submission.user.email,
                submission.submitted_at,
                cisData.address,
                cisData.birth_date,
                cisData.phone,
                ...Object.values(answers),
            ].join(','));
        }

        const csvContent = csvData.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${form.form_name}_Respons_Full_CSV_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Fungsi untuk membuka di Google Sheets atau download
    const openInGoogleSheets = (dataUri, sheetName) => {
        const googleSheetsUrl = 'https://docs.google.com/spreadsheets/u/0/import?usp=importhtm&';
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUri;
        downloadLink.download = `${form.form_name}_${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        const openInSheets = () => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = googleSheetsUrl;
            form.target = '_blank';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'data';
            input.value = dataUri.split(',')[1]; // Base64 data

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        };

        if (window.confirm(`Buka ${sheetName} di Google Sheets? Klik "Cancel" untuk download file Excel.`)) {
            openInSheets();
        } else {
            downloadLink.click();
        }
    };

    // Handle table sorting
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    // Toggle dropdown visibility
    const toggleDropdown = (submissionId) => {
        setOpenDropdownId(openDropdownId === submissionId ? null : submissionId);
    };

    // Calculate fixed position for table view dropdown
    const getTableDropdownPosition = (submissionId) => {
        const button = document.querySelector(`[data-submission-id="${submissionId}"]`);
        if (!button) return { top: 0, left: 0 };

        const rect = button.getBoundingClientRect();
        const dropdownHeight = 100;
        const dropdownWidth = 192;
        const spaceBelow = window.innerHeight - rect.bottom;
        const viewportWidth = window.innerWidth;

        let top = rect.bottom + 8;
        let left = rect.right - dropdownWidth;

        if (top + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - 8;
        }

        if (left < 0) {
            left = 8;
        } else if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 8;
        }

        return { top, left };
    };

    // Calculate fixed position for grid view dropdown
    const getGridDropdownPosition = (submissionId) => {
        const button = document.querySelector(`[data-submission-id="${submissionId}"]`);
        if (!button) return { top: 0, left: 0 };

        const rect = button.getBoundingClientRect();
        const dropdownHeight = 100;
        const dropdownWidth = 192;
        const spaceAbove = rect.top;
        const viewportWidth = window.innerWidth;

        let top = rect.top - dropdownHeight - 8;
        let left = rect.right - dropdownWidth;

        if (top < 0) {
            top = rect.bottom + 8;
        }

        if (left < 0) {
            left = 8;
        } else if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 8;
        }

        return { top, left };
    };

    // Filter submissions based on search
    const filteredSubmissions = submissions.filter((submission) => {
        if (!submission) return false;
        return (
            (submission.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (submission.user?.nim || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (submission.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title={'Respons Formulir - ' + form.form_name} />

            {/* Notification */}
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
                                className={`h-5 w-5 ${notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
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
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {'Respons Formulir: ' + form.form_name}
                            </h1>
                            <p className="text-gray-500 mt-1">{'Beasiswa: ' + form.scholarship_name}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari nama, NIM, atau email..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg
                                    className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
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
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-md ${
                                        viewMode === 'table'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    } transition-all duration-200`}
                                    title="Tampilan Tabel"
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
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md ${
                                        viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    } transition-all duration-200`}
                                    title="Tampilan Grid"
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
                            </div>
                            <a
                                href="https://docs.google.com/spreadsheets/d/your-spreadsheet-id-here/edit?usp=sharing" // Ganti dengan link Google Spreadsheet yang sesuai
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                                title="Lihat di Google Spreadsheet"
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Lihat Spreadsheet
                            </a>
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setShowExportOptions(!showExportOptions)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
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
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Ekspor
                                </button>
                                <button
                                    onClick={() => setShowExportOptions(!showExportOptions)}
                                    className="ml-2 bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition focus:outline-none"
                                    aria-label="More export options"
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
                                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                        />
                                    </svg>
                                </button>
                                {showExportOptions && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    exportToExcelOption1();
                                                    setShowExportOptions(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
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
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Nama, NIM, Jawaban
                                            </button>
                                            <button
                                                onClick={() => {
                                                    exportToExcelOption2();
                                                    setShowExportOptions(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
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
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Full Data
                                            </button>
                                            <button
                                                onClick={() => {
                                                    exportToCSVOption1();
                                                    setShowExportOptions(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
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
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                    />
                                                </svg>
                                                Download .csv (Nama, NIM, Jawaban)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    exportToCSVOption2();
                                                    setShowExportOptions(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
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
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                    />
                                                </svg>
                                                Download .csv (Full Data)
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                {viewMode === 'table' && filteredSubmissions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('no')}
                                    >
                                        No
                                        {sortBy === 'no' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('name')}
                                    >
                                        Nama
                                        {sortBy === 'name' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('nim')}
                                    >
                                        NIM
                                        {sortBy === 'nim' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('email')}
                                    >
                                        Email
                                        {sortBy === 'email' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('submitted_at')}
                                    >
                                        Tanggal Pengajuan
                                        {sortBy === 'submitted_at' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSubmissions.map((submission, index) => {
                                    const dropdownPosition = openDropdownId === submission.submission_id ? getTableDropdownPosition(submission.submission_id) : { top: 0, left: 0 };
                                    return (
                                        <tr key={submission.submission_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {submission.user?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {submission.user?.nim || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {submission.user?.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {submission.submitted_at !== '-' ? moment(submission.submitted_at).format('DD MMM YYYY HH:mm') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div
                                                    className="relative"
                                                    ref={(el) => (dropdownRefs.current[submission.submission_id] = el)}
                                                >
                                                    <button
                                                        onClick={() => toggleDropdown(submission.submission_id)}
                                                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition focus:outline-none"
                                                        aria-label="More actions"
                                                        aria-expanded={openDropdownId === submission.submission_id}
                                                        data-submission-id={submission.submission_id}
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
                                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    {openDropdownId === submission.submission_id && (
                                                        <div
                                                            className="fixed w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                                                            style={{
                                                                top: dropdownPosition.top + 'px',
                                                                left: dropdownPosition.left + 'px',
                                                            }}
                                                        >
                                                            <div className="py-1">
                                                                <Link
                                                                    href={route('admin.form.response.detail', {
                                                                        form: form.form_id,
                                                                        submission: submission.submission_id,
                                                                    })}
                                                                    className="flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                                                                    onClick={() => setOpenDropdownId(null)}
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
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                    Lihat Detail
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && filteredSubmissions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubmissions.map((submission, index) => {
                            const dropdownPosition = openDropdownId === submission.submission_id ? getGridDropdownPosition(submission.submission_id) : { top: 0, left: 0 };
                            return (
                                <div
                                    key={submission.submission_id}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative hover:shadow-xl transition-shadow"
                                >
                                    <div className="absolute top-4 right-4">
                                        <div
                                            className="relative"
                                            ref={(el) => (dropdownRefs.current[submission.submission_id] = el)}
                                        >
                                            <button
                                                onClick={() => toggleDropdown(submission.submission_id)}
                                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition focus:outline-none"
                                                aria-label="More actions"
                                                aria-expanded={openDropdownId === submission.submission_id}
                                                data-submission-id={submission.submission_id}
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
                                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                    />
                                                </svg>
                                            </button>
                                            {openDropdownId === submission.submission_id && (
                                                <div
                                                    className="fixed w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                                                    style={{
                                                        top: dropdownPosition.top + 'px',
                                                        left: dropdownPosition.left + 'px',
                                                    }}
                                                >
                                                    <div className="py-1">
                                                        <Link
                                                            href={route('admin.form.response.detail', {
                                                                form: form.form_id,
                                                                submission: submission.submission_id,
                                                            })}
                                                            className="flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                                                            onClick={() => setOpenDropdownId(null)}
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
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                            Lihat Detail
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{submission.user?.name || '-'}</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">NIM:</span> {submission.user?.nim || '-'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Email:</span> {submission.user?.email || '-'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Tanggal Pengajuan:</span>{' '}
                                        {submission.submitted_at !== '-' ? moment(submission.submitted_at).format('DD MMM YYYY HH:mm') : '-'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {filteredSubmissions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada respons yang tersedia</h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian Anda.' : 'Belum ada respons untuk formulir ini.'}
                        </p>
                        {searchTerm ? (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
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
                                href={route('admin.form.index')}
                                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center shadow-md"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Kembali ke Daftar Formulir
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}