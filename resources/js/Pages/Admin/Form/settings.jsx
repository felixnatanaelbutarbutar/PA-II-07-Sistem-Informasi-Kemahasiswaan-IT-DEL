import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import moment from 'moment';

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 text-red-800 rounded-lg">
                    <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
                    <p>Maaf, ada masalah saat memuat halaman. Silakan coba lagi.</p>
                    <Link
                        href="/admin/form"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Kembali ke Daftar
                    </Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Settings({ auth, userRole, permissions, menu, form, settings, flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        setting_id: settings?.setting_id || '',
        form_id: form.form_id,
        accept_responses: settings?.accept_responses ?? true,
        one_submission_per_email: settings?.one_submission_per_email ?? false,
        allow_edit: settings?.allow_edit ?? true,
        submission_start: settings?.submission_start
            ? moment(settings.submission_start).format('YYYY-MM-DDTHH:mm')
            : '',
        submission_deadline: settings?.submission_deadline
            ? moment(settings.submission_deadline).format('YYYY-MM-DDTHH:mm')
            : '',
        max_submissions: settings?.max_submissions || '',
        response_notification: settings?.response_notification ?? false,
        updated_by: auth.user.id,
    });

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setNotification({
                show: true,
                type: flash.success ? 'success' : 'error',
                message: flash.success || flash.error,
            });
            const timer = setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const validateDates = () => {
        if (data.submission_start && data.submission_deadline) {
            const start = new Date(data.submission_start);
            const end = new Date(data.submission_deadline);
            if (end < start) {
                setDateError('Batas waktu pengumpulan harus setelah waktu mulai.');
                return false;
            }
        }
        setDateError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateDates()) {
            return;
        }
        post(route('admin.form.settings.update', form.form_id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Pengaturan formulir berhasil diperbarui!',
                });
                reset();
            },
            onError: () => {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal memperbarui pengaturan: Periksa kembali isian Anda.',
                });
            },
        });
    };

    return (
        <ErrorBoundary>
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title={`Pengaturan Formulir - ${form.form_name}`} />

                {notification.show && (
                    <div
                        className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl ${
                            notification.type === 'success'
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                        }`}
                    >
                        <div className="flex items-center">
                            <svg
                                className={`h-5 w-5 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notification.type === 'success' ? (
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
                            <p className={`ml-3 text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                {notification.message}
                            </p>
                            <button
                                onClick={() => setNotification({ show: false, type: '', message: '' })}
                                className="ml-auto p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                            >
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
                )}

                <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Pengaturan Formulir: {form.form_name}
                                </h1>
                                <p className="text-gray-600 text-sm">Kelola pengaturan untuk formulir beasiswa</p>
                            </div>
                            <Link
                                href="/admin/form"
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="accept_responses"
                                    checked={data.accept_responses}
                                    onChange={(e) => setData('accept_responses', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="accept_responses" className="text-sm text-gray-700">
                                    Terima Respons
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="one_submission_per_email"
                                    checked={data.one_submission_per_email}
                                    onChange={(e) => setData('one_submission_per_email', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="one_submission_per_email" className="text-sm text-gray-700">
                                    Satu Pengiriman per Email
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="allow_edit"
                                    checked={data.allow_edit}
                                    onChange={(e) => setData('allow_edit', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="allow_edit" className="text-sm text-gray-700">
                                    Izinkan Edit
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="response_notification"
                                    checked={data.response_notification}
                                    onChange={(e) => setData('response_notification', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="response_notification" className="text-sm text-gray-700">
                                    Notifikasi Respons
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="submission_start" className="block text-sm font-medium text-gray-700">
                                Waktu Mulai Pengumpulan
                                <span className="ml-2 text-gray-500 text-xs" title="Formulir akan aktif otomatis saat waktu mulai tercapai">
                                    (?)
                                </span>
                            </label>
                            <input
                                type="datetime-local"
                                id="submission_start"
                                value={data.submission_start}
                                onChange={(e) => setData('submission_start', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                                    errors.submission_start || dateError ? 'border-red-500' : 'border-gray-300'
                                } focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.submission_start && (
                                <p className="text-red-500 text-xs mt-1">{errors.submission_start}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="submission_deadline" className="block text-sm font-medium text-gray-700">
                                Batas Waktu Pengumpulan
                                <span className="ml-2 text-gray-500 text-xs" title="Formulir akan non-aktif otomatis setelah waktu ini">
                                    (?)
                                </span>
                            </label>
                            <input
                                type="datetime-local"
                                id="submission_deadline"
                                value={data.submission_deadline}
                                onChange={(e) => setData('submission_deadline', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                                    errors.submission_deadline || dateError ? 'border-red-500' : 'border-gray-300'
                                } focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {(errors.submission_deadline || dateError) && (
                                <p className="text-red-500 text-xs mt-1">{errors.submission_deadline || dateError}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="max_submissions" className="block text-sm font-medium text-gray-700">
                                Maksimum Pengiriman
                            </label>
                            <input
                                type="number"
                                id="max_submissions"
                                value={data.max_submissions}
                                onChange={(e) => setData('max_submissions', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                                    errors.max_submissions ? 'border-red-500' : 'border-gray-300'
                                } focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Kosongkan untuk tanpa batas"
                                min="1"
                            />
                            {errors.max_submissions && (
                                <p className="text-red-500 text-xs mt-1">{errors.max_submissions}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Link
                                href="/admin/form"
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ErrorBoundary>
    );
}
