import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ auth, userRole, permissions, mpm, navigation }) {
    const { flash } = usePage().props ?? {};
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mpmIdToDelete, setMpmIdToDelete] = useState(null);

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

    const handleDeleteClick = (mpmId) => {
        setMpmIdToDelete(mpmId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (mpmIdToDelete) {
            router.delete(route('admin.mpm.destroy', mpmIdToDelete), {
                onFinish: () => {
                    setShowDeleteModal(false);
                    setMpmIdToDelete(null);
                },
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setMpmIdToDelete(null);
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Kelola Data MPM" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${notificationType === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                        }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'
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
                                className={`text-sm font-medium ${notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                    }`}
                            >
                                {notificationMessage}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setShowNotification(false)}
                                    className={`inline-flex rounded-md p-1.5 ${notificationType === 'success'
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
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg
                                    className="w-8 h-8 text-red-600"
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
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                            Konfirmasi Penghapusan
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Apakah Anda yakin ingin menghapus data MPM ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
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
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Kelola Data MPM
                                </h1>
                                <p className="text-gray-500 mt-1">Kelola data organisasi MPM</p>
                            </div>
                            {!mpm && (
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <Link
                                        href={route('admin.mpm.create')}
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
                                        Tambah Data MPM
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MPM Data */}
                    {mpm ? (
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                            {/* Logo MPM */}
                            {mpm.logo && (
                                <div className="mb-6 text-center">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Logo MPM</h2>
                                    <img
                                        src={`/storage/${mpm.logo}`}
                                        alt="Logo MPM"
                                        className="w-32 h-32 object-contain mx-auto rounded-full"
                                    />
                                </div>
                            )}

                            {/* Perkenalan MPM */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Perkenalan MPM</h2>
                                <p className="text-gray-600">{mpm.introduction || 'Tidak ada'}</p>
                            </div>

                            {/* Ketua dan Sekretaris */}
                            {mpm.structure && (
                                <>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Struktur Organisasi</h2>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700">Ketua</h3>
                                        <div className="flex items-center">
                                            {mpm.structure.chairman?.photo && (
                                                <img
                                                    src={`/storage/${mpm.structure.chairman.photo}`}
                                                    alt="Foto Ketua"
                                                    className="w-16 h-16 object-cover rounded-full mr-4"
                                                    onError={(e) => (e.target.style.display = 'none')} // Sembunyikan jika gambar gagal dimuat
                                                />
                                            )}
                                            <p className="text-gray-600">
                                                {mpm.structure.chairman?.name || 'Tidak ada'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700">Sekretaris</h3>
                                        <div className="flex items-center">
                                            {mpm.structure.secretary?.photo && (
                                                <img
                                                    src={`/storage/${mpm.structure.secretary.photo}`}
                                                    alt="Foto Sekretaris"
                                                    className="w-16 h-16 object-cover rounded-full mr-4"
                                                    onError={(e) => (e.target.style.display = 'none')} // Sembunyikan jika gambar gagal dimuat
                                                />
                                            )}
                                            <p className="text-gray-600">
                                                {mpm.structure.secretary?.name || 'Tidak ada'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Komisi */}
                                    {mpm.structure.commissions && mpm.structure.commissions.length > 0 && (
                                        <>
                                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
                                                Struktur Komisi
                                            </h2>
                                            {mpm.structure.commissions.map((commission, index) => (
                                                <div key={index} className="mb-6">
                                                    <h3 className="text-lg font-semibold text-gray-700">
                                                        {commission.name || 'Komisi Tanpa Nama'}
                                                    </h3>
                                                    <div className="flex items-center">
                                                        {commission.chairman?.photo && (
                                                            <img
                                                                src={`/storage/${commission.chairman.photo}`}
                                                                alt={`Foto Ketua ${commission.name || 'Komisi'}`}
                                                                className="w-16 h-16 object-cover rounded-full mr-4"
                                                                onError={(e) =>
                                                                    (e.target.style.display = 'none')
                                                                } // Sembunyikan jika gambar gagal dimuat
                                                            />
                                                        )}
                                                        <p className="text-gray-600">
                                                            <strong>Ketua:</strong>{' '}
                                                            {commission.chairman?.name || 'Tidak ada'}
                                                        </p>
                                                    </div>
                                                    {commission.members && commission.members.length > 0 && (
                                                        <>
                                                            <h4 className="text-md font-semibold text-gray-700 mt-2">
                                                                Anggota:
                                                            </h4>
                                                            <ul className="list-decimal pl-5 text-gray-600">
                                                                {commission.members.map((member, memberIndex) => (
                                                                    <li
                                                                        key={memberIndex}
                                                                        className="mb-2 flex items-center"
                                                                    >
                                                                        {member.photo && (
                                                                            <img
                                                                                src={`/storage/${member.photo}`}
                                                                                alt={`Foto ${member.name || 'Anggota'}`}
                                                                                className="w-12 h-12 object-cover rounded-full mr-2"
                                                                                onError={(e) =>
                                                                                    (e.target.style.display = 'none')
                                                                                } // Sembunyikan jika gambar gagal dimuat
                                                                            />
                                                                        )}
                                                                        {member.name || 'Anggota Tanpa Nama'}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    )}
                                                    {commission.work_programs &&
                                                        commission.work_programs.length > 0 && (
                                                            <>
                                                                <h4 className="text-md font-semibold text-gray-700 mt-2">
                                                                    Program Kerja:
                                                                </h4>
                                                                <ul className="list-decimal pl-5 text-gray-600">
                                                                    {commission.work_programs.map(
                                                                        (program, programIndex) => (
                                                                            <li key={programIndex} className="mb-2">
                                                                                {program || 'Program Tanpa Nama'}
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </>
                                                        )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Visi dan Misi</h2>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Visi</h3>
                                <p className="text-gray-600">{mpm.vision || 'Tidak ada'}</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Misi</h3>
                                {mpm.mission && mpm.mission.length > 0 ? (
                                    <ul className="list-decimal pl-5 text-gray-600">
                                        {mpm.mission.map((mission, index) => (
                                            <li key={index} className="mb-2">
                                                {mission || 'Misi Tanpa Deskripsi'}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600">Tidak ada misi</p>
                                )}
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Status Rekrutmen</h2>
                            <p className="text-gray-600">{mpm.recruitment_status || 'Tidak ada'}</p>

                            <div className="mt-6 flex space-x-4">
                                <Link
                                    href={route('admin.mpm.edit', mpm.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Edit
                                </Link>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    onClick={() => handleDeleteClick(mpm.id)}
                                >
                                    Hapus
                                </button>
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
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                Tidak ada data MPM yang tersedia
                            </h3>
                            <p className="text-gray-500 text-center max-w-md mb-6">
                                Silakan tambahkan data MPM baru untuk mulai mengisi konten website Anda.
                            </p>
                            <Link
                                href={route('admin.mpm.create')}
                                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center shadow-md"
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Data MPM Baru
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
