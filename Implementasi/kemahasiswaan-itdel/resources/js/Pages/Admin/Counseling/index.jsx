import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CounselingIndex({ auth, counselings, userRole, permissions, menu }) {
    const { flash } = usePage().props;
    const [statusUpdating, setStatusUpdating] = useState({});

    console.log("User Role di AdminLayout:", userRole);

    // Handle status change
    const handleStatusChange = (counselingId, newStatus) => {
        setStatusUpdating((prev) => ({ ...prev, [counselingId]: true }));
        router.post(
            route('admin.counseling.update', counselingId),
            { status: newStatus },
            {
                onSuccess: () => {
                    // Refresh the page to reflect the updated status and flash message
                    router.visit(route('admin.counseling.index'), {
                        preserveState: true,
                        preserveScroll: true,
                    });
                },
                onFinish: () => {
                    setStatusUpdating((prev) => ({ ...prev, [counselingId]: false }));
                },
                onError: (errors) => {
                    console.error('Error updating status:', errors);
                },
            }
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Manajemen Permintaan Konseling" />

            {/* CSS Styles */}
            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .header img {
                        vertical-align: middle;
                        margin-right: 10px;
                    }
                    .header h2 {
                        font-size: 28px;
                        font-weight: bold;
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .table-container {
                        background: #ffffff;
                        border-radius: 15px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        overflow-x: auto;
                    }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .table th,
                    .table td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .table th {
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        color: #ffffff;
                        font-weight: bold;
                    }
                    .table tr:hover {
                        background-color: #f5f7fa;
                    }
                    .status-select {
                        padding: 5px;
                        border: 1px solid #3498db;
                        border-radius: 5px;
                        background: #ffffff;
                        color: #333333;
                        font-size: 14px;
                        cursor: pointer;
                        transition: border-color 0.3s ease;
                    }
                    .status-select:focus {
                        border-color: #2980b9;
                        outline: none;
                    }
                    .status-select:disabled {
                        background: #cccccc;
                        cursor: not-allowed;
                    }
                    .status-pending {
                        color: #e67e22;
                        font-weight: bold;
                    }
                    .status-in_progress {
                        color: #3498db;
                        font-weight: bold;
                    }
                    .status-completed {
                        color: #28a745;
                        font-weight: bold;
                    }
                    .status-canceled {
                        color: #e74c3c;
                        font-weight: bold;
                    }
                    .success-toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #28a745;
                        color: #ffffff;
                        padding: 15px 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        animation: fadeInOut 3s ease-in-out;
                        z-index: 1000;
                    }
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateY(-20px); }
                        10% { opacity: 1; transform: translateY(0); }
                        90% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-20px); }
                    }
                `}
            </style>

            <div className="container">
                {flash?.success && (
                    <div className="success-toast">
                        <img
                            src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                            width="20"
                            height="20"
                            alt="Success Icon"
                        />
                        {flash.success}
                    </div>
                )}

                <div className="header">
                    <img
                        src="https://img.icons8.com/fluency/48/000000/chat.png"
                        width="30"
                        height="30"
                        alt="Chat Icon"
                    />
                    <h2>Manajemen Permintaan Konseling</h2>
                </div>

                <div className="table-container">
                    {counselings.data.length === 0 ? (
                        <p className="text-center text-gray-500">
                            Belum ada permintaan konseling.
                        </p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama Mahasiswa</th>
                                    <th>Masalah</th>
                                    <th>Nomor Telepon</th>
                                    <th>Tanggal Pengajuan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counselings.data.map((counseling) => (
                                    <tr key={counseling.id}>
                                        <td>{counseling.user.name}</td>
                                        <td>{counseling.issue}</td>
                                        <td>{counseling.noTelephone}</td>
                                        <td>
                                            {new Date(counseling.created_at).toLocaleDateString(
                                                'id-ID',
                                                {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-${counseling.status}`}
                                            >
                                                {counseling.status === 'pending'
                                                    ? 'Menunggu'
                                                    : counseling.status === 'in_progress'
                                                        ? 'Sedang Diproses'
                                                        : counseling.status === 'completed'
                                                            ? 'Selesai'
                                                            : 'Dibatalkan'}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="status-select"
                                                value={counseling.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        counseling.id,
                                                        e.target.value
                                                    )
                                                }
                                                disabled={statusUpdating[counseling.id]}
                                            >
                                                <option value="pending">Menunggu</option>
                                                <option value="in_progress">Sedang Diproses</option>
                                                <option value="completed">Selesai</option>
                                                <option value="canceled">Dibatalkan</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {/* Pagination Links */}
                    {counselings.links && (
                        <div className="mt-4 flex justify-center">
                            {counselings.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    className={`px-3 py-1 mx-1 rounded ${link.active
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}