import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function MahasiswaDashboard({ auth }) {
    return (
        <AdminLayout
            user={auth.user}
            userRole="mahasiswa"
            permissions={{}}
            navigation={[
                {
                    name: 'Dashboard',
                    route: 'mahasiswa.dashboard',
                    icon: 'dashboard',
                    visible: true,
                },
                {
                    name: 'Beasiswa',
                    route: 'mahasiswa.dashboard',
                    icon: 'graduation-cap',
                    visible: true,
                },
                {
                    name: 'Profil',
                    route: 'mahasiswa.dashboard',
                    icon: 'user',
                    visible: true,
                },
            ]}
        >
            <Head title="Mahasiswa Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-semibold">
                                Dashboard Beasiswa
                            </h1>

                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="rounded-lg bg-blue-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-blue-800">
                                        Beasiswa Aktif
                                    </h3>
                                    <p className="text-3xl font-bold text-blue-600">
                                        3
                                    </p>
                                </div>

                                <div className="rounded-lg bg-green-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-green-800">
                                        Beasiswa Tersedia
                                    </h3>
                                    <p className="text-3xl font-bold text-green-600">
                                        7
                                    </p>
                                </div>

                                <div className="rounded-lg bg-purple-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-purple-800">
                                        Pengajuan
                                    </h3>
                                    <p className="text-3xl font-bold text-purple-600">
                                        2
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-6 shadow">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Beasiswa Tersedia
                                </h2>
                                <div className="mt-4 space-y-4">
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                Beasiswa Prestasi Akademik
                                            </h3>
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                                Dibuka
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-600">
                                            Beasiswa untuk mahasiswa dengan IPK
                                            di atas 3.5
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Deadline: 30 Juni 2023
                                            </span>
                                            <button className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                                                Daftar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                Beasiswa Penelitian
                                            </h3>
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                                Dibuka
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-600">
                                            Beasiswa untuk mahasiswa yang aktif
                                            dalam penelitian
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Deadline: 15 Juli 2023
                                            </span>
                                            <button className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                                                Daftar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                Beasiswa Kegiatan Mahasiswa
                                            </h3>
                                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                                Segera
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-600">
                                            Beasiswa untuk mahasiswa yang aktif
                                            dalam kegiatan kemahasiswaan
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Dibuka: 1 Juli 2023
                                            </span>
                                            <button className="cursor-not-allowed rounded bg-gray-300 px-3 py-1 text-sm text-gray-600">
                                                Belum Dibuka
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
