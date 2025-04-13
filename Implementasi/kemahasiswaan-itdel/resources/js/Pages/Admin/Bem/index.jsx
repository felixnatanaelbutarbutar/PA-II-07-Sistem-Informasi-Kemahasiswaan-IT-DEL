// resources/js/Pages/Admin/Bem/index.jsx
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function index({ bem, auth, userRole, permissions, navigation }) {
    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data BEM ini?')) {
            router.delete(route('admin.bem.destroy', id), {
                onSuccess: () => alert('Data BEM berhasil dihapus.'),
            });
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Kelola BEM" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">Kelola Data BEM</h1>
                            {bem ? (
                                <Link
                                    href={route('admin.bem.edit', bem.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Edit Data BEM
                                </Link>
                            ) : (
                                <Link
                                    href={route('admin.bem.create')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Tambah Data BEM
                                </Link>
                            )}
                        </div>

                        {bem ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700">Visi</h2>
                                    <p className="text-gray-600">{bem.vision}</p>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700">Misi</h2>
                                    <p className="text-gray-600">{bem.mission}</p>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700">Struktur Organisasi</h2>
                                    {bem.structure && (
                                        <div className="space-y-4">
                                            {/* Ketua BEM */}
                                            <div className="border p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold">Ketua BEM</h3>
                                                <p><strong>Nama:</strong> {bem.structure['Ketua BEM']?.name}</p>
                                                {bem.structure['Ketua BEM']?.photo && (
                                                    <img
                                                        src={`/storage/${bem.structure['Ketua BEM'].photo}`}
                                                        alt="Ketua BEM"
                                                        className="w-32 h-32 object-cover rounded-full mt-2"
                                                    />
                                                )}
                                            </div>

                                            {/* Sekretaris */}
                                            <div className="border p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold">Sekretaris</h3>
                                                <p><strong>Nama:</strong> {bem.structure['Sekretaris']?.name}</p>
                                                {bem.structure['Sekretaris']?.photo && (
                                                    <img
                                                        src={`/storage/${bem.structure['Sekretaris'].photo}`}
                                                        alt="Sekretaris"
                                                        className="w-32 h-32 object-cover rounded-full mt-2"
                                                    />
                                                )}
                                            </div>

                                            {/* Departemen */}
                                            {bem.structure.departments && bem.structure.departments.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mt-4">Departemen</h3>
                                                    {bem.structure.departments.map((dept, deptIndex) => (
                                                        <div key={deptIndex} className="border p-4 rounded-lg mt-2">
                                                            <h4 className="text-md font-semibold">{dept.name}</h4>
                                                            {dept.members && dept.members.length > 0 ? (
                                                                <ul className="list-disc pl-5 mt-2">
                                                                    {dept.members.map((member, memberIndex) => (
                                                                        <li key={memberIndex} className="flex items-center space-x-4 mb-2">
                                                                            <div>
                                                                                <p><strong>{member.position}:</strong> {member.name}</p>
                                                                                {member.photo && (
                                                                                    <img
                                                                                        src={`/storage/${member.photo}`}
                                                                                        alt={member.name}
                                                                                        className="w-16 h-16 object-cover rounded-full mt-1"
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-gray-500">Tidak ada anggota di departemen ini.</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700">Program Kerja</h2>
                                    {bem.work_programs && (
                                        <ul className="list-disc pl-5 text-gray-600">
                                            {bem.work_programs.map((program, index) => (
                                                <li key={index}>{program}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700">Status Rekrutmen</h2>
                                    <p className="text-gray-600">{bem.recruitment_status}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(bem.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Hapus Data BEM
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500">Belum ada data BEM. Silakan tambah data baru.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}