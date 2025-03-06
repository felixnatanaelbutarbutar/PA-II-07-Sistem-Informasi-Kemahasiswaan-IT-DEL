import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    console.log("Dashboard loaded");

    return (
        <>
            <Head title="Admin Dashboard" />
            <div>
                <h1>Dashboard Admin</h1>
                <p>Selamat datang di dashboard admin!</p>
            </div>
        </>
    );
}

Dashboard.layout = page => <AdminLayout>{page}</AdminLayout>;
