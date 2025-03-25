import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function SuperAdminDashboard({ auth }) {
    return (
        <AdminLayout
            user={auth.user}
            userRole="superadmin"
            permissions={{}}
            navigation={[
                {
                    name: 'Dashboard',
                    route: 'superadmin.dashboard',
                    icon: 'dashboard',
                    visible: true,
                },
                {
                    name: 'Manage Users',
                    route: 'superadmin.dashboard',
                    icon: 'users',
                    visible: true,
                },
                {
                    name: 'System Settings',
                    route: 'superadmin.dashboard',
                    icon: 'cogs',
                    visible: true,
                },
            ]}
        >
            <Head title="Super Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-semibold">
                                Welcome, Super Admin
                            </h1>

                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="rounded-lg bg-blue-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-blue-800">
                                        Total Users
                                    </h3>
                                    <p className="text-3xl font-bold text-blue-600">
                                        25
                                    </p>
                                </div>

                                <div className="rounded-lg bg-green-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-green-800">
                                        Active Modules
                                    </h3>
                                    <p className="text-3xl font-bold text-green-600">
                                        8
                                    </p>
                                </div>

                                <div className="rounded-lg bg-purple-100 p-6 shadow">
                                    <h3 className="mb-2 text-lg font-medium text-purple-800">
                                        System Health
                                    </h3>
                                    <p className="text-3xl font-bold text-purple-600">
                                        Good
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-6 shadow">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Quick Actions
                                </h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <button className="flex flex-col items-center rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50">
                                        <i className="fas fa-user-plus mb-2 text-2xl text-blue-500"></i>
                                        <span>Add User</span>
                                    </button>
                                    <button className="flex flex-col items-center rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50">
                                        <i className="fas fa-cog mb-2 text-2xl text-gray-500"></i>
                                        <span>System Settings</span>
                                    </button>
                                    <button className="flex flex-col items-center rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50">
                                        <i className="fas fa-database mb-2 text-2xl text-green-500"></i>
                                        <span>Backup Data</span>
                                    </button>
                                    <button className="flex flex-col items-center rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50">
                                        <i className="fas fa-file-alt mb-2 text-2xl text-purple-500"></i>
                                        <span>View Logs</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
