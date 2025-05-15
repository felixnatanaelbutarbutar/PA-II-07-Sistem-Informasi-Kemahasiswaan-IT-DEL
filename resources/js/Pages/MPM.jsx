import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function MPM({ mpm }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (mpm) {
            setIsLoading(false);
        } else {
            setError('Tidak ada data MPM aktif saat ini.');
            setIsLoading(false);
        }
    }, [mpm]);

    return (
        <GuestLayout>
            <Navbar />
            <Head title="MPM IT Del" />
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm text-red-600 animate__animated animate__fadeIn">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-96">
                            <svg
                                className="animate-spin h-12 w-12 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        </div>
                    ) : (
                        <>
                            {mpm ? (
                                <>
                                    {/* Header Section */}
                                    <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn">
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                            {mpm.logo ? (
                                                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                                                    <img
                                                        src={`/storage/${mpm.logo}`}
                                                        alt="Logo MPM"
                                                        className="w-full h-full object-contain rounded-full border-2 border-gray-200 shadow-sm"
                                                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100?text=Logo+MPM')}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
                                                    Tidak ada logo
                                                </div>
                                            )}
                                            <div className="flex-1 text-center sm:text-left">
                                                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                                    Majelis Permusyawaratan Mahasiswa (MPM)
                                                </h2>
                                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-2">
                                                    {mpm.introduction || 'Tidak ada perkenalan.'}
                                                </p>
                                                <p className="text-gray-800 font-semibold text-sm sm:text-base">
                                                    Periode: {mpm.management_period || 'Tidak ada periode.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            {['chairman', 'vice_chairman', 'secretary'].map((role, index) => (
                                                <div key={index} className="flex flex-col items-center">
                                                    <p className="text-gray-800 font-semibold text-sm sm:text-base mb-2 capitalize">
                                                        {role === 'vice_chairman' ? 'Wakil Ketua' : role === 'chairman' ? 'Ketua' : 'Sekretaris'}
                                                    </p>
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {mpm.structure?.[role]?.name || 'Tidak ada'}
                                                    </p>
                                                    {mpm.structure?.[role]?.photo ? (
                                                        <img
                                                            src={`/storage/${mpm.structure[role].photo}`}
                                                            alt={`Foto ${role}`}
                                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                            onError={(e) =>
                                                                (e.target.src = 'https://via.placeholder.com/120?text=Foto')
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                            Tidak ada foto
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Visi & Misi Section */}
                                    <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                                            Visi & Misi MPM
                                        </h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Visi</h3>
                                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                                    {mpm.vision || 'Tidak ada visi.'}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Misi</h3>
                                                {mpm.mission && mpm.mission.length > 0 ? (
                                                    <ul className="list-disc pl-5 text-gray-600 text-sm sm:text-base leading-relaxed">
                                                        {mpm.mission.map((mission, index) => (
                                                            <li key={index} className="mb-2">
                                                                {mission || 'Misi Tanpa Deskripsi'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-600 text-sm sm:text-base">Tidak ada misi.</p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Struktur Komisi Section */}
                                    <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn" id="struktur-komisi">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                                            Struktur Komisi MPM
                                        </h2>
                                        {mpm.structure?.commissions && mpm.structure.commissions.length > 0 ? (
                                            <div className="space-y-8">
                                                {mpm.structure.commissions.map((commission, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                                                            {commission.name || 'Komisi Tanpa Nama'}
                                                        </h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            <div className="flex flex-col items-center">
                                                                <p className="text-gray-800 font-semibold text-sm sm:text-base mb-2">Ketua</p>
                                                                <p className="text-gray-600 text-sm mb-3">
                                                                    {commission.chairman?.name || 'Tidak ada'}
                                                                </p>
                                                                {commission.chairman?.photo ? (
                                                                    <img
                                                                        src={`/storage/${commission.chairman.photo}`}
                                                                        alt={`Foto Ketua ${commission.name || 'Komisi'}`}
                                                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                                        onError={(e) =>
                                                                            (e.target.src = 'https://via.placeholder.com/120?text=Foto')
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                                        Tidak ada foto
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {commission.members && commission.members.length > 0 ? (
                                                                commission.members.map((member, memberIndex) => (
                                                                    <div key={memberIndex} className="flex flex-col items-center">
                                                                        <p className="text-gray-800 font-semibold text-sm sm:text-base mb-2">Anggota</p>
                                                                        <p className="text-gray-600 text-sm mb-3">
                                                                            {member.name || 'Anggota Tanpa Nama'}
                                                                        </p>
                                                                        {member.photo ? (
                                                                            <img
                                                                                src={`/storage/${member.photo}`}
                                                                                alt={`Foto ${member.name || 'Anggota'}`}
                                                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                                                onError={(e) =>
                                                                                    (e.target.src = 'https://via.placeholder.com/80?text=Foto')
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                                                Tidak ada foto
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-2 text-center text-gray-600 text-sm sm:text-base">
                                                                    Tidak ada anggota.
                                                                </div>
                                                            )}
                                                        </div>
                                                        {commission.work_programs && commission.work_programs.length > 0 && (
                                                            <div className="mt-6">
                                                                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Program Kerja</h4>
                                                                <ul className="list-disc pl-5 text-gray-600 text-sm sm:text-base">
                                                                    {commission.work_programs.map((program, programIndex) => (
                                                                        <li key={programIndex} className="mb-2">
                                                                            {program || 'Program Tanpa Deskripsi'}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 text-sm sm:text-base">Tidak ada komisi.</p>
                                        )}
                                    </section>

                                    {/* Partisipasi Anda Section */}
                                    <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 mb-8 text-white text-center animate__animated animate__fadeIn" id="partisipasi-anda">
                                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b-2 border-white pb-2">
                                            Partisipasi Anda
                                        </h2>
                                        <div className="space-y-2 mb-6">
                                            {mpm.recruitment_status && (
                                                <p className="text-sm sm:text-base font-medium">
                                                    Status Rekrutmen: {mpm.recruitment_status === 'OPEN' ? 'Dibuka' : 'Ditutup'}
                                                </p>
                                            )}
                                            {mpm.aspiration_status && (
                                                <p className="text-sm sm:text-base font-medium">
                                                    Status Pendataan Aspirasi: {mpm.aspiration_status === 'OPEN' ? 'Dibuka' : 'Ditutup'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                                            {mpm.recruitment_status === 'OPEN' && (
                                                <a
                                                    href="#"
                                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                        />
                                                    </svg>
                                                    Open Recruitment
                                                </a>
                                            )}
                                            <Link
                                                href={mpm.aspiration_status === 'OPEN' ? route('aspiration.index') : '#'}
                                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                                                    mpm.aspiration_status === 'OPEN'
                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                                onClick={(e) => {
                                                    if (mpm.aspiration_status !== 'OPEN') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                                    />
                                                </svg>
                                                Pendataan Aspirasi
                                            </Link>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 animate__animated animate__fadeIn">
                                    <svg
                                        className="w-16 h-16 text-gray-400 mb-4 mx-auto"
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
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Tidak ada data MPM aktif</h3>
                                    <p className="text-gray-600 text-sm">Belum ada data MPM aktif yang tersedia saat ini.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}