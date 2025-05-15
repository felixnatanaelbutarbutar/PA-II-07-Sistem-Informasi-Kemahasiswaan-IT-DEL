import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function BEM({ bem }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDepartments, setExpandedDepartments] = useState({});
    const { url } = usePage();

    useEffect(() => {
        if (bem) {
            setIsLoading(false);
        } else {
            setError('Gagal memuat data BEM');
            setIsLoading(false);
        }
    }, [bem]);

    useEffect(() => {
        const hash = url.split('#')[1];
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [url]);

    const toggleDepartment = (deptIndex) => {
        setExpandedDepartments((prev) => ({
            ...prev,
            [deptIndex]: !prev[deptIndex],
        }));
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title="BEM IT Del" />
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-inter">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-md text-red-600 animate__animated animate__fadeIn">
                            {error}
                        </div>
                    )}

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
                            {bem ? (
                                <>
                                    <section className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn" id="profil-bem">
                                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 border-b-2 border-blue-500 pb-2">
                                            Badan Eksekutif Mahasiswa (BEM)
                                        </h2>
                                        {bem.logo ? (
                                            <div className="flex justify-center mb-6">
                                                <img
                                                    src={`/storage/${bem.logo}`}
                                                    alt="Logo BEM IT Del"
                                                    className="w-32 h-32 object-contain rounded-lg shadow-md"
                                                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=Logo+BEM')}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex justify-center mb-6">
                                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                                    Tidak ada logo
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{bem.introduction || 'Tidak ada perkenalan.'}</p>
                                    </section>

                                    <section className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn" id="visi-misi">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                                            Visi & Misi BEM
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Visi</h3>
                                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                                    {bem.vision || 'Tidak ada visi.'}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Misi</h3>
                                                {bem.mission && bem.mission.length > 0 ? (
                                                    <ul className="list-disc pl-5 text-gray-600 text-sm sm:text-base space-y-2">
                                                        {bem.mission.map((mission, index) => (
                                                            <li key={index}>{mission || 'Misi Tanpa Deskripsi'}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-600 text-sm sm:text-base">Tidak ada misi.</p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn" id="struktur-organisasi">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                                            Struktur Organisasi BEM
                                        </h2>
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">BPH BEM IT Del</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {bem.structure?.positions?.map((position, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center"
                                                        >
                                                            {position.photo ? (
                                                                <img
                                                                    src={`/storage/${position.photo}`}
                                                                    alt={position.name}
                                                                    className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                                    onError={(e) => (e.target.src = 'https://via.placeholder.com/120?text=Foto')}
                                                                />
                                                            ) : (
                                                                <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                                    Tidak ada foto
                                                                </div>
                                                            )}
                                                            <div className="mt-2">
                                                                <h4 className="text-sm sm:text-base font-semibold text-gray-800">{position.title}</h4>
                                                                <p className="text-gray-600 text-sm">{position.name}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Departemen</h3>
                                                {bem.structure?.departments?.map((dept, deptIndex) => (
                                                    <div key={deptIndex} className="mb-4">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-blue-600 transition-all"
                                                            onClick={() => toggleDepartment(deptIndex)}
                                                        >
                                                            <span className="text-sm sm:text-base font-semibold">{dept.name}</span>
                                                            <svg
                                                                className={`w-5 h-5 transition-transform ${expandedDepartments[deptIndex] ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                        {expandedDepartments[deptIndex] && (
                                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {dept.members && dept.members.length > 0 ? (
                                                                    dept.members.map((member, memberIndex) => (
                                                                        <div
                                                                            key={memberIndex}
                                                                            className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center"
                                                                        >
                                                                            {member.photo ? (
                                                                                <img
                                                                                    src={`/storage/${member.photo}`}
                                                                                    alt={member.name}
                                                                                    className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                                                    onError={(e) => (e.target.src = 'https://via.placeholder.com/80?text=Foto')}
                                                                                />
                                                                            ) : (
                                                                                <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                                                    Tidak ada foto
                                                                                </div>
                                                                            )}
                                                                            <div className="mt-2">
                                                                                <h4 className="text-sm font-semibold text-gray-800">{member.position}</h4>
                                                                                <p className="text-gray-600 text-sm">{member.name}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-gray-600 text-sm sm:text-base">Belum ada anggota di departemen ini.</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate__animated animate__fadeIn" id="program-kerja">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                                            Program Kerja BEM
                                        </h2>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                                            {bem.work_programs?.description || 'Tidak ada deskripsi program kerja.'}
                                        </p>
                                        {bem.work_programs?.programs && bem.work_programs.programs.length > 0 ? (
                                            <ul className="list-disc pl-5 text-gray-600 text-sm sm:text-base space-y-2">
                                                {bem.work_programs.programs.map((program, index) => (
                                                    <li key={index}>{program || 'Program Tanpa Deskripsi'}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-600 text-sm sm:text-base">Tidak ada program kerja.</p>
                                        )}
                                    </section>

                                    <section className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 mb-8 text-white text-center animate__animated animate__fadeIn" id="partisipasi-anda">
                                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b-2 border-white pb-2">
                                            Partisipasi Anda
                                        </h2>
                                        <div className="mb-4">
                                            <div
                                                className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
                                                    bem.recruitment_status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'
                                                }`}
                                            >
                                                {bem.recruitment_status === 'OPEN' ? 'OPEN RECRUITMENT' : 'CLOSED RECRUITMENT'}
                                            </div>
                                        </div>
                                        {bem.recruitment_status === 'OPEN' && (
                                            <a
                                                href="#"
                                                className="block mt-4 text-white font-medium hover:text-blue-200 transition-colors duration-300 text-sm sm:text-base"
                                            >
                                                Daftar Sekarang!
                                            </a>
                                        )}
                                    </section>
                                </>
                            ) : (
                                <div className="bg-white/90 rounded-2xl shadow-lg p-8 text-center border border-gray-100 animate__animated animate__fadeIn">
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
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Tidak ada data BEM</h3>
                                    <p className="text-gray-600 text-sm">Belum ada data BEM yang tersedia saat ini.</p>
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