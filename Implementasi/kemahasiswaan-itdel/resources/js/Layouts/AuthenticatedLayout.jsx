import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const { props } = usePage();
    console.log("Inertia props:", props); // 🔍 Debugging

    const user = props.auth?.user; // Menghindari error undefined

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <h1 className="text-lg font-bold">
                                {user ? `Welcome, ${user.name}` : "Loading..."}
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    );
}
