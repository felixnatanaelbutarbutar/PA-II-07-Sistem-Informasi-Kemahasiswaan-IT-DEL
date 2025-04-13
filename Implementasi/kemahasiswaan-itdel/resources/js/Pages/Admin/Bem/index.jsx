import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ auth, userRole, permissions, bem, navigation }) {
    const { flash } = usePage().props ?? {};
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bemIdToDelete, setBemIdToDelete] = useState(null);

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

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    const handleDeleteClick = (bemId) => {
        setBemIdToDelete(bemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (bemIdToDelete) {
            router.delete(
                route('admin.bem.destroy', bemIdToDelete),
                {
                    onFinish: () => {
                        setShowDeleteModal(false);
                        setBemIdToDelete(null);
                    },
                }
            );
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBemIdToDelete(null);
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Kelola Data BEM" />

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
                            <div className="-mx-1.5 -my-1.5">
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
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Konfirmasi Penghapusan</h3>
                        <p className="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus data BEM ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Kelola Data BEM</h1>
                                <p className="text-gray-500 mt-1">Kelola data organisasi BEM</p>
                            </div>
                            {/* Hanya tampilkan tombol "Tambah Data BEM" jika belum ada data */}
                            {!bem && (
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <Link
                                        href={route('admin.bem.create')}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Tambah Data BEM
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BEM Data */}
                    {bem ? (
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                            {/* Logo BEM */}
                            {bem.logo && (
                                <div className="mb-6 text-center">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Logo BEM</h2>
                                    <img
                                        src={`/storage/${bem.logo}`}
                                        alt="Logo BEM"
                                        className="w-32 h-32 object-contain mx-auto"
                                    />
                                </div>
                            )}

                            {/* Perkenalan BEM */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Perkenalan BEM</h2>
                                <p className="text-gray-600">{bem.introduction}</p>
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visi dan Misi</h2>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Visi</h3>
                                <p className="text-gray-600">{bem.vision}</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Misi</h3>
                                <ul className="list-decimal pl-5 text-gray-600">
                                    {bem.mission?.map((mission, index) => (
                                        <li key={index} className="mb-2">{mission}</li>
                                    ))}
                                </ul>
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Struktur Organisasi</h2>

                            {/* Jabatan Utama BEM */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Jabatan Utama (BPH)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bem.structure?.positions?.map((position, index) => (
                                        <div key={index} className="border p-4 rounded-lg">
                                            <h4 className="text-lg font-semibold text-gray-800">{position.title}</h4>
                                            <p className="text-gray-600">{position.name}</p>
                                            {position.photo ? (
                                                <div className="mt-2 w-32 h-32">
                                                    <img
                                                        src={`/storage/${position.photo}`}
                                                        alt={position.name}
                                                        className="w-full h-full object-cover rounded-lg aspect-square"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mt-2 w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-500">Tidak ada foto</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Departemen */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Departemen</h3>
                                {bem.structure?.departments?.map((dept, deptIndex) => (
                                    <div key={deptIndex} className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{dept.name}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {dept.members && dept.members.length > 0 ? (
                                                dept.members.map((member, memberIndex) => (
                                                    <div key={memberIndex} className="border p-4 rounded-lg">
                                                        <p className="text-gray-600 font-semibold">{member.position}</p>
                                                        <p className="text-gray-600">{member.name}</p>
                                                        {member.photo ? (
                                                            <div className="mt-2 w-32 h-32">
                                                                <img
                                                                    src={`/storage/${member.photo}`}
                                                                    alt={member.name}
                                                                    className="w-full h-full object-cover rounded-lg aspect-square"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <span className="text-gray-500">Tidak ada foto</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600">Belum ada anggota di departemen ini.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Program Kerja</h2>
                            <p className="text-gray-600 mb-2">{bem.work_programs?.description}</p>
                            <ul className="list-decimal pl-5 text-gray-600">
                                {bem.work_programs?.programs?.map((program, index) => (
                                    <li key={index} className="mb-2">{program}</li>
                                ))}
                            </ul>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Status Rekrutmen</h2>
                            <p className="text-gray-600">{bem.recruitment_status}</p>

                            <div className="mt-6 flex space-x-4">
                                <Link
                                    href={route('admin.bem.edit', bem.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Edit
                                </Link>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    onClick={() => handleDeleteClick(bem.id)}
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada data BEM yang tersedia</h3>
                            <p className="text-gray-500 text-center max-w-md mb-6">
                                Silakan tambahkan data BEM baru untuk mulai mengisi konten website Anda.
                            </p>
                            <Link
                                href={route('admin.bem.create')}
                                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center shadow-md"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Tambah Data BEM Baru
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}