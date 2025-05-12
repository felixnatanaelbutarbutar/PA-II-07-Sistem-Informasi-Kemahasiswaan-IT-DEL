import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

export default function OrganizationAdminIndex({ permissions, navigation, existingAdmins, notification, students, searchQuery }) {
    const { props } = usePage();
    const { auth, userRole } = props;

    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [searchInput, setSearchInput] = useState(searchQuery || '');
    const [localExistingAdmins, setLocalExistingAdmins] = useState(existingAdmins || {});

    useEffect(() => {
        // Handle flash messages (notification prop)
        if (notification) {
            setNotificationMessage(notification.message);
            setNotificationType(notification.type);
            setShowNotification(true);

            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSetRole = (student, role) => {
        const studentData = {
            nim: student.nim,
            username: student.username,
            email: student.email,
            name: student.name,
            prodi: student.prodi || null,
            role: role,
        };

        router.post(route('admin.organization-admins.setRole'), studentData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Perbarui localExistingAdmins secara manual
                const updatedAdmins = { ...localExistingAdmins };
                if (role === 'mahasiswa') {
                    delete updatedAdmins[student.nim]; // Hapus dari existingAdmins jika role jadi mahasiswa
                } else {
                    updatedAdmins[student.nim] = {
                        role: role,
                        status: 'active',
                    };
                }
                setLocalExistingAdmins(updatedAdmins);

                setNotificationMessage(`Role berhasil diperbarui untuk ${student.name}`);
                setNotificationType('success');
                setShowNotification(true);
            },
            onError: (errors) => {
                setNotificationMessage('Gagal memperbarui role. Silakan coba lagi.');
                setNotificationType('error');
                setShowNotification(true);
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('admin.organization-admins.index'),
            { search: searchInput, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route('admin.organization-admins.index'),
            { search: searchInput, page: page },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={navigation}
        >
            <Head title="Kelola Admin Organisasi" />

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

            <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Kelola Admin Organisasi
                            </h1>
                            <p className="text-gray-500 mt-1">Atur role mahasiswa sebagai Admin BEM atau Admin MPM</p>
                        </div>
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Cari berdasarkan NIM, nama, atau prodi..."
                                className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 w-64"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Cari
                            </button>
                        </form>
                    </div>
                </div>

                {/* Student Table */}
                {students.data.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        NIM
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Username
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Prodi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Role
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Status
                                    </th> */}
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi Ubah Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.data.map((student) => {
                                    const existingAdmin = localExistingAdmins[student.nim];
                                    const currentRole = existingAdmin ? existingAdmin.role : student.role;
                                    const currentStatus = existingAdmin ? existingAdmin.status : 'N/A';

                                    return (
                                        <tr key={student.user_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {student.nim}
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.username}
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.prodi || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        currentRole === 'adminbem'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : currentRole === 'adminmpm'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {currentRole === 'adminbem'
                                                        ? 'Admin BEM'
                                                        : currentRole === 'adminmpm'
                                                        ? 'Admin MPM'
                                                        : 'Mahasiswa'}
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {currentStatus !== 'N/A' ? (
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            currentStatus === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {currentStatus === 'active' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <select
                                                    value={currentRole}
                                                    onChange={(e) => handleSetRole(student, e.target.value)}
                                                    className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="mahasiswa">Mahasiswa</option>
                                                    <option value="adminbem">Admin BEM</option>
                                                    <option value="adminmpm">Admin MPM</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div className="p-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Menampilkan {students.data.length} dari {students.total} mahasiswa
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(students.current_page - 1)}
                                    disabled={students.current_page === 1}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md disabled:opacity-50"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => handlePageChange(students.current_page + 1)}
                                    disabled={students.current_page === students.last_page}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md disabled:opacity-50"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Tidak ada data mahasiswa yang tersedia
                        </h3>
                        <p className="text-gray-500 text-center max-w-md">
                            Tidak ada data mahasiswa yang dapat ditampilkan dari CIS API.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}