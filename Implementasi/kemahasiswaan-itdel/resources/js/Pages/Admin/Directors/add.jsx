// resources/js/Pages/Admin/Directors/add.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Add({ auth, userRole, permissions, menu }) {
    const { post, setData, data, errors, processing } = useForm({
        name: '',
        welcome_message: '',
        photo: null,
        is_active: true,
    });

    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState('success');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.directors.store'), {
            onSuccess: () => {
                setNotificationMessage('Director added successfully!');
                setNotificationType('success');
                setShowNotification(true);
            },
            onError: () => {
                setNotificationMessage('Failed to add director.');
                setNotificationType('error');
                setShowNotification(true);
            },
        });
    };

    const handleFileChange = (e) => {
        setData('photo', e.target.files[0]);
    };

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Add Director" />

            {showNotification && (
                <div className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                    notificationType === 'success'
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                        : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                }`}>
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

            <div className="p-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Add Director</h1>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Director Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Director Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        {/* Welcome Message */}
                        <div>
                            <label htmlFor="welcome_message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Welcome Message
                            </label>
                            <textarea
                                id="welcome_message"
                                value={data.welcome_message}
                                onChange={(e) => setData('welcome_message', e.target.value)}
                                rows="4"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.welcome_message && <span className="text-red-500 text-sm">{errors.welcome_message}</span>}
                        </div>

                        {/* Photo */}
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Photo
                            </label>
                            <input
                                type="file"
                                id="photo"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-gray-900 dark:text-gray-300"
                            />
                            {errors.photo && <span className="text-red-500 text-sm">{errors.photo}</span>}
                        </div>

                        {/* Is Active */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Active
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save'}
                        </button>
                        <Link
                            href={route('admin.directors.index')}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}