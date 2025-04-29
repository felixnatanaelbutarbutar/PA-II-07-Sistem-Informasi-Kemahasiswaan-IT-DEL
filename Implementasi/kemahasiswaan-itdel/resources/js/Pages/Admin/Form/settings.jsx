import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import moment from 'moment';

// Error Boundary Component
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
    const { data, setData, put, processing, errors, reset } = useForm({
        setting_id: settings?.setting_id || '',
        form_id: form.form_id,
        is_active: settings?.is_active ?? true,
        accept_responses: settings?.accept_responses ?? true,
        one_submission_per_email: settings?.one_submission_per_email ?? false,
        allow_edit: settings?.allow_edit ?? true,
        submission_deadline: settings?.submission_deadline
            ? moment(settings.submission_deadline).format('YYYY-MM-DDTHH:mm')
            : '',
        max_submissions: settings?.max_submissions || '',
        response_notification: settings?.response_notification ?? false,
        updated_by: auth.user.id,
    });

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        if (flash) {
            if (flash.success) {
                setNotification({ show: true, type: 'success', message: flash.success });
            } else if (flash.error) {
                setNotification({ show: true, type: 'error', message: flash.error });
            }

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setNotification({ show: false, type: '', message: '' });
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('form.settings.update', form.form_id), {
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
            onError: (err) => {
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

                {/* Notification */}
                {notification.show && (
                    <div
                        className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                            notification.type === 'success'
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                                : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                        }`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className={`h-5 w-5 ${notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
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
                            </div>
                            <div className="ml-3">
                                <p
                                    className={`text-sm font-medium ${
                                        notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                    }`}
                                >
                                    {notification.message}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setNotification({ show: false, type: '', message: '' })}
                                    className={`inline-flex rounded-md p-1.5 ${
                                        notification.type === 'success'
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

                <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Pengaturan Formulir: {form.form_name}
                                </h1>
                                <p className="text-gray-500 mt-1">Kelola pengaturan untuk formulir beasiswa</p>
                            </div>
                            <Link
                                href="/admin/form"
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Kembali ke Daftar
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status Aktif */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Formulir Aktif
                                </label>
                            </div>

                            {/* Terima Respons */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="accept_responses"
                                    checked={data.accept_responses}
                                    onChange={(e) => setData('accept_responses', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="accept_responses" className="text-sm font-medium text-gray-700">
                                    Terima Respons
                                </label>
                            </div>

                            {/* Satu Pengiriman per Email */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="one_submission_per_email"
                                    checked={data.one_submission_per_email}
                                    onChange={(e) => setData('one_submission_per_email', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="one_submission_per_email" className="text-sm font-medium text-gray-700">
                                    Satu Pengiriman per Email
                                </label>
                            </div>

                            {/* Izinkan Edit */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="allow_edit"
                                    checked={data.allow_edit}
                                    onChange={(e) => setData('allow_edit', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="allow_edit" className="text-sm font-medium text-gray-700">
                                    Izinkan Edit Setelah Pengiriman
                                </label>
                            </div>

                            {/* Notifikasi Respons */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="response_notification"
                                    checked={data.response_notification}
                                    onChange={(e) => setData('response_notification', e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="response_notification" className="text-sm font-medium text-gray-700">
                                    Kirim Notifikasi Respons
                                </label>
                            </div>
                        </div>

                        {/* Batas Pengumpulan */}
                        <div>
                            <label htmlFor="submission_deadline" className="block text-sm font-medium text-gray-700">
                                Batas Waktu Pengumpulan
                            </label>
                            <input
                                type="datetime-local"
                                id="submission_deadline"
                                value={data.submission_deadline}
                                onChange={(e) => setData('submission_deadline', e.target.value)}
                                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                    errors.submission_deadline
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errors.submission_deadline && (
                                <p className="text-red-500 text-xs mt-1">{errors.submission_deadline}</p>
                            )}
                        </div>

                        {/* Maksimum Pengiriman */}
                        <div>
                            <label htmlFor="max_submissions" className="block text-sm font-medium text-gray-700">
                                Maksimum Pengiriman
                            </label>
                            <input
                                type="number"
                                id="max_submissions"
                                value={data.max_submissions}
                                onChange={(e) => setData('max_submissions', e.target.value)}
                                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                    errors.max_submissions
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="Kosongkan untuk tidak ada batas"
                                min="1"
                            />
                            {errors.max_submissions && (
                                <p className="text-red-500 text-xs mt-1">{errors.max_submissions}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Link
                                href="/admin/form"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Pengaturan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ErrorBoundary>
    );
}
