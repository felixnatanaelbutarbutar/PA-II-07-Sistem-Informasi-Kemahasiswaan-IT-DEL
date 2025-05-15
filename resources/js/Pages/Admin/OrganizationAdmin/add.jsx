import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function OrganizationAdminCreate({ auth, userRole, permissions, navigation }) {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'adminbem',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.organization-admins.store'));
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={navigation}
        >
            <Head title="Tambah Admin Organisasi" />

            <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6">
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Tambah Admin Organisasi
                    </h1>
                    <p className="text-gray-500 mt-1">Tambahkan akun admin BEM atau MPM baru</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nama</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="adminbem">Admin BEM</option>
                                <option value="adminmpm">Admin MPM</option>
                            </select>
                            {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('admin.organization-admins.index')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}