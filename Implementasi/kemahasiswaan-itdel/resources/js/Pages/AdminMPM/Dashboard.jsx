    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Head } from '@inertiajs/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function AdminMPMDashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    MPM Admin Dashboard
                </h2>
            }
        >
            <Head title="MPM Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-medium">
                                Welcome to MPM Admin Dashboard!
                            </h3>
                            <p className="mb-4">
                                You are logged in as an MPM Administrator.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="rounded-lg bg-indigo-50 p-6 shadow">
                                    <h4 className="mb-2 font-semibold text-indigo-700">
                                        MPM Programs
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Manage MPM programs and activities
                                    </p>
                                </div>
                                <div className="rounded-lg bg-pink-50 p-6 shadow">
                                    <h4 className="mb-2 font-semibold text-pink-700">
                                        Legislation
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Manage student legislation and policies
                                    </p>
                                </div>
                                <div className="rounded-lg bg-cyan-50 p-6 shadow">
                                    <h4 className="mb-2 font-semibold text-cyan-700">
                                        Member Management
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Manage MPM members and committees
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
