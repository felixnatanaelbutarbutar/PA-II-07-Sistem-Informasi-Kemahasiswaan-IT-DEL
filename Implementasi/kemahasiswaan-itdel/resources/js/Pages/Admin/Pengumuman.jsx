import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Pengumuman({ auth }) {
    // Determine the role from auth
    const userRole = auth?.user?.role || 'adminbem';

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={{}}
            navigation={[
                {
                    name: 'Dashboard',
                    route: 'admin.dashboard',
                    icon: 'dashboard',
                    visible: true,
                },
                {
                    name: 'Pengumuman',
                    route: 'admin.pengumuman',
                    icon: 'bullhorn',
                    visible: true,
                },
                ...(userRole === 'adminbem'
                    ? [
                          {
                              name: 'Kegiatan',
                              route: 'admin.kegiatan',
                              icon: 'calendar',
                              visible: true,
                          },
                          {
                              name: 'Layanan',
                              route: 'admin.layanan',
                              icon: 'handshake',
                              visible: true,
                          },
                      ]
                    : []),
                ...(userRole === 'adminmpm'
                    ? [
                          {
                              name: 'Organisasi',
                              route: 'admin.organisasi',
                              icon: 'users',
                              visible: true,
                          },
                          {
                              name: 'Layanan',
                              route: 'admin.layanan',
                              icon: 'handshake',
                              visible: true,
                          },
                      ]
                    : []),
            ]}
        >
            <Head title="Kelola Pengumuman" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-semibold">
                                Kelola Pengumuman
                            </h1>

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Cari pengumuman..."
                                        className="rounded-md border border-gray-300 px-4 py-2"
                                    />
                                </div>
                                <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                                    + Tambah Pengumuman
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Judul
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        <tr>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    Pengumuman Penerimaan
                                                    Beasiswa
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Informasi tentang penerimaan
                                                    beasiswa periode 2023
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    15 Maret 2023
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                    Dipublikasi
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <button className="mr-3 text-blue-600 hover:text-blue-900">
                                                    Edit
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    Jadwal UAS Semester Ganjil
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Pengumuman jadwal UAS
                                                    semester ganjil 2023/2024
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    20 November 2023
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                    Dipublikasi
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <button className="mr-3 text-blue-600 hover:text-blue-900">
                                                    Edit
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    Pemilihan Presiden Mahasiswa
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Pengumuman pemilihan
                                                    presiden mahasiswa periode
                                                    2024
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    5 Januari 2024
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                                                    Draft
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <button className="mr-3 text-blue-600 hover:text-blue-900">
                                                    Edit
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
