import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Detail({ auth, userRole, permissions, bem, navigation }) {
    const { flash } = usePage().props ?? {};
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (flash) {
            if (flash.success || flash.error) {
                setShowNotification(true);
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Detail Data BEM" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl ${
                        flash.success
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${flash.success ? 'text-emerald-500' : 'text-rose-500'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {flash.success ? (
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
                            <p className={`text-sm font-medium ${flash.success ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {flash.success || flash.error}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className={`ml-auto pl-3 ${flash.success ? 'text-emerald-500 hover:bg-emerald-100' : 'text-rose-500 hover:bg-rose-100'} focus:outline-none`}
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

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
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

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nama Kabinet</h2>
                            <p className="text-gray-600">{bem.cabinet_name || 'Tidak ada nama kabinet'}</p>
                        </div>

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
                            <Link
                                href={route('admin.bem.index')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}