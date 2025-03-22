import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AdminBEMDashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    BEM Admin Dashboard
                </h2>
            }
        >
            <Head title="BEM Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-medium">
                                Welcome to BEM Admin Dashboard!
                            </h3>
                            <p className="mb-4">
                                You are logged in as a BEM Administrator.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="rounded-lg bg-blue-50 p-6 shadow">
                                    <h4 className="mb-2 font-semibold text-blue-700">
                                        BEM Programs
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Manage BEM programs and activities
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-6 shadow">
                                    <h4 className="mb-2 font-semibold text-green-700">
                                        Budget Management
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Manage BEM budget and expenses
                                    </p>
                                </div>
                                <div className="rounded-lg bg-orange-50 p-6 shadow">
                                    <h4 className="mb-2 font-semibold text-orange-700">
                                        Member Management
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Manage BEM members and divisions
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
