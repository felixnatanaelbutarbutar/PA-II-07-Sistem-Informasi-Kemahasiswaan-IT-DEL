import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Detail({ auth, userRole, permissions, mpm, navigation }) {
    const { flash } = usePage().props ?? {};
    const [showNotification, setShowNotification] = useState(!!flash?.success || !!flash?.error);
    const [notificationMessage, setNotificationMessage] = useState(flash?.success || flash?.error || '');
    const [notificationType, setNotificationType] = useState(flash?.success ? 'success' : 'error');

    useEffect(() => {
        if (flash) {
            setShowNotification(!!flash.success || !!flash.error);
            setNotificationMessage(flash.success || flash.error || '');
            setNotificationType(flash.success ? 'success' : 'error');

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Detail Data MPM" />

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

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Detail Data MPM
                                </h1>
                                <p className="text-gray-500 mt-1">Lihat detail data organisasi MPM</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <Link
                                    href={route('admin.mpm.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center shadow-md"
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
                                            d="M11 17l-5-5m0 0l5-5m-5 5h12"
                                        />
                                    </svg>
                                    Kembali
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* MPM Data */}
                    {mpm ? (
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                            {/* Periode Keperngurusan */}
                            <div className="border-t-2 border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Periode Keperngurusan</h2>
                                <p className="text-gray-600 leading-relaxed">{mpm.management_period || 'Tidak ada'}</p>
                            </div>

                            {/* Logo MPM */}
                            <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Logo MPM</h2>
                                {mpm.logo ? (
                                    <div className="text-center">
                                        <img
                                            src={`/storage/${mpm.logo}`}
                                            alt="Logo MPM"
                                            className="w-32 h-32 object-contain mx-auto rounded-full border-2 border-gray-200 shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center">Tidak ada logo</p>
                                )}
                            </div>

                            {/* Perkenalan MPM */}
                            <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Perkenalan MPM</h2>
                                <p className="text-gray-600 leading-relaxed">{mpm.introduction || 'Tidak ada'}</p>
                            </div>

                            {/* Struktur Organisasi */}
                            {mpm.structure && (
                                <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Struktur Organisasi</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ketua</h3>
                                            <div className="flex items-center">
                                                {mpm.structure.chairman?.photo && (
                                                    <img
                                                        src={`/storage/${mpm.structure.chairman.photo}`}
                                                        alt="Foto Ketua"
                                                        className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-gray-200"
                                                        onError={(e) => (e.target.style.display = 'none')}
                                                    />
                                                )}
                                                <p className="text-gray-600">
                                                    {mpm.structure.chairman?.name || 'Tidak ada'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Wakil Ketua</h3>
                                            <div className="flex items-center">
                                                {mpm.structure.vice_chairman?.photo && (
                                                    <img
                                                        src={`/storage/${mpm.structure.vice_chairman.photo}`}
                                                        alt="Foto Wakil Ketua"
                                                        className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-gray-200"
                                                        onError={(e) => (e.target.style.display = 'none')}
                                                    />
                                                )}
                                                <p className="text-gray-600">
                                                    {mpm.structure.vice_chairman?.name || 'Tidak ada'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sekretaris</h3>
                                            <div className="flex items-center">
                                                {mpm.structure.secretary?.photo && (
                                                    <img
                                                        src={`/storage/${mpm.structure.secretary.photo}`}
                                                        alt="Foto Sekretaris"
                                                        className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-gray-200"
                                                        onError={(e) => (e.target.style.display = 'none')}
                                                    />
                                                )}
                                                <p className="text-gray-600">
                                                    {mpm.structure.secretary?.name || 'Tidak ada'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Struktur Komisi */}
                            {mpm.structure && mpm.structure.commissions && mpm.structure.commissions.length > 0 && (
                                <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Struktur Komisi</h2>
                                    {mpm.structure.commissions.map((commission, index) => (
                                        <div
                                            key={index}
                                            className="border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-sm bg-gray-50"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                {commission.name || `Komisi ${index + 1}`}
                                            </h3>
                                            <div className="flex items-center mb-4">
                                                {commission.chairman?.photo && (
                                                    <img
                                                        src={`/storage/${commission.chairman.photo}`}
                                                        alt={`Foto Ketua ${commission.name || 'Komisi'}`}
                                                        className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-gray-200"
                                                        onError={(e) => (e.target.style.display = 'none')}
                                                    />
                                                )}
                                                <p className="text-gray-600">
                                                    <strong>Ketua:</strong> {commission.chairman?.name || 'Tidak ada'}
                                                </p>
                                            </div>
                                            {commission.members && commission.members.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-md font-semibold text-gray-700 mb-2">
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
                                                                        className="w-12 h-12 object-cover rounded-full mr-2 border-2 border-gray-200"
                                                                        onError={(e) =>
                                                                            (e.target.style.display = 'none')
                                                                        }
                                                                    />
                                                                )}
                                                                {member.name || 'Anggota Tanpa Nama'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {commission.work_programs && commission.work_programs.length > 0 && (
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                                                        Program Kerja:
                                                    </h4>
                                                    <ul className="list-decimal pl-5 text-gray-600">
                                                        {commission.work_programs.map((program, programIndex) => (
                                                            <li key={programIndex} className="mb-2">
                                                                {program || 'Program Tanpa Nama'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Visi dan Misi */}
                            <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Visi dan Misi</h2>
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Visi</h3>
                                    <p className="text-gray-600 leading-relaxed">{mpm.vision || 'Tidak ada'}</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Misi</h3>
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
                            </div>

                            {/* Status Rekrutmen */}
                            <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Status Rekrutmen</h2>
                                <p
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        mpm.recruitment_status === 'OPEN'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {mpm.recruitment_status || 'Tidak ada'}
                                </p>
                            </div>

                            {/* Status Aktif */}
                            <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Status Aktif</h2>
                                <p
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        mpm.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {mpm.is_active ? 'Aktif' : 'Nonaktif'}
                                </p>
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
                                href={route('admin.mpm.index')}
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
                                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                                    />
                                </svg>
                                Kembali
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}