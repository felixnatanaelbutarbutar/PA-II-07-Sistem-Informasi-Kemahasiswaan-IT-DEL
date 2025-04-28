import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrganizationAdminIndex({ permissions, navigation, existingAdmins, notification }) {
    const { props } = usePage();
    const { auth, userRole } = props; // Access auth and userRole from shared props

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

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

        // Fetch student data from CIS API via proxy endpoint
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
        
            try {
                console.log('Sending request to /api/cis/students with credentials');
                console.log('Request config:', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    withCredentials: true,
                });
                const response = await axios.get('/api/cis/students', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    withCredentials: true,
                });
                console.log('Response status:', response.status);
                console.log('Response data:', response.data);
        
                if (Array.isArray(response.data)) {
                    setStudents(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                    throw new Error('Unexpected response format from CIS API: Data is not an array');
                }
            } catch (err) {
                console.error('Error fetching students from CIS API:', err);
                if (err.response) {
                    console.log('Error response status:', err.response.status);
                    console.log('Error response data:', err.response.data);
                    const { status, data } = err.response;
                    if (status === 401) {
                        setError('Gagal memuat data mahasiswa: Token autentikasi tidak valid. Silakan login kembali.');
                    } else if (status === 500) {
                        setError(`Gagal memuat data mahasiswa: ${data.error || 'Kesalahan server. Silakan coba lagi nanti.'}`);
                    } else {
                        setError(`Gagal memuat data mahasiswa: ${data.error || 'Terjadi kesalahan. Silakan coba lagi nanti.'}`);
                    }
                } else {
                    setError(`Gagal memuat data mahasiswa: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [notification]);

    const handleSetRole = (student, role) => {
        // Prepare the data to send to the backend
        const studentData = {
            nim: student.nim,
            username: student.username,
            email: student.email,
            name: student.name,
            prodi: student.prodi || null,
            role: role,
        };

        // Send the POST request to set the role
        router.post(route('admin.organization-admins.setRole'), studentData, {
            onSuccess: () => {
                // Refresh the student list after setting the role
                const updatedStudents = students.map(s => {
                    if (s.nim === student.nim) {
                        return { ...s, role: role };
                    }
                    return s;
                });
                setStudents(updatedStudents);
            },
            onError: (errors) => {
                setNotificationMessage('Gagal memperbarui role. Silakan coba lagi.');
                setNotificationType('error');
                setShowNotification(true);
            },
        });
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
                        <Link
                            href={route('admin.organization-admins.create')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
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
                            Tambah Admin
                        </Link>
                    </div>
                </div>

                {/* Student Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <svg
                            className="animate-spin h-10 w-10 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            {error}
                        </h3>
                    </div>
                ) : students.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        NIM
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Username
                                    </th>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => {
                                    // Check if the student exists in the existingAdmins (from your users table)
                                    const existingAdmin = existingAdmins[student.nim];
                                    const currentRole = existingAdmin ? existingAdmin.role : student.role;
                                    const currentStatus = existingAdmin ? existingAdmin.status : 'N/A';

                                    return (
                                        <tr key={student.user_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {student.nim}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.username}
                                            </td>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
                                            </td>
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