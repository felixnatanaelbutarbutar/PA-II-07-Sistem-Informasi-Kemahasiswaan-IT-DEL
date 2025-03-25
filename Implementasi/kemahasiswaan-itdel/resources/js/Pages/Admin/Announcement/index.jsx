import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, permissions, userRole, menu }) {
    const { announcement = [] } = usePage().props ?? {};
    const [searchTerm, setSearchTerm] = useState("");

    console.log("User Role di AdminLayout:", userRole);
    console.log("Announcements:", announcement);

    const handleDelete = (announcement_id) => {
        console.log('Deleting announcement with ID:', announcement_id); // Debugging
        if (confirm("Yakin ingin menghapus berita ini?")) {
            router.delete(route("admin.announcement.destroy", announcement_id), {
                preserveState: false,
                onSuccess: () => {
                    alert('Pengumuman berhasil dihapus.');
                },
                onError: (errors) => {
                    console.error('Error deleting announcement:', errors);
                    alert('Gagal menghapus pengumuman.');
                },
            });
        }
    };

    const filteredAnnouncement = announcement.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout
            user={auth.user}
            userRole={userRole}
            permissions={permissions}
            navigation={menu}
        >
            <Head title="Kelola Berita" />

            <div className="py-10 max-w-7xl mx-auto px-4">
                {/* Header with Search */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">Manajemenn Berita</h1>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0 md:w-64">
                            <input
                                type="text"
                                placeholder="Cari berita..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <Link
                            href={route("admin.announcement.create")}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Berita
                        </Link>
                    </div>
                </div>

                {/* announcement FlexBox Layout */}
                <div className="flex flex-wrap -mx-3">
                    {filteredAnnouncement.map((item) => {
                        console.log('Announcement ID:', item.announcement_id);
                        return (
                            <div key={item.announcement_id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-3 mb-6">
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col transition duration-300 hover:shadow-xl border border-gray-100">
                                    {/* Image Container with Consistent Height */}
                                    <div className="h-52 overflow-hidden relative">
                                        <img
                                            src={item.file ? `/storage/${item.file}` : "/assets/images/slide2.png"}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition duration-500 hover:scale-105"
                                            onError={(e) => (e.target.src = "/assets/images/slide2.png")}
                                        />
                                        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                                            {item.category ? item.category.category_name : "Uncategorized"}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h2>

                                        {/* Date and Views */}
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                            <Link
                                                href={route('admin.announcement.edit', item.announcement_id)}
                                                className="flex items-center text-blue-600 hover:text-blue-700 transition cursor-pointer"
                                                onClick={() => console.log('Navigating to edit:', item.announcement_id)}
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(item.announcement_id)}
                                                className="flex items-center text-red-600 hover:text-red-700 transition cursor-pointer"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredAnnouncement.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-700 mb-1">Tidak ada berita yang tersedia</h3>
                        <p className="text-gray-500">
                            {searchTerm ? "Tidak ada hasil yang cocok dengan pencarian Anda" : "Silahkan tambahkan berita baru"}
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
