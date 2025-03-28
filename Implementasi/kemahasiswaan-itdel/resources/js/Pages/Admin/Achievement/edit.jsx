import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ auth, userRole, permissions, menu, achievement, achievementTypes }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: achievement.title || '',
        description: achievement.description || '',
        category: achievement.category || '',
        achievement_type_id: achievement.achievement_type_id || '',
        medal: achievement.medal || '',
        event_name: achievement.event_name || '',
        event_date: achievement.event_date || '',
        created_by: achievement.created_by || auth.user.id,
        updated_by: auth.user.id, // Set updated_by to the current user
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.achievements.update', achievement.achievement_id), {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            },
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Prestasi" />

            <div className="py-10 max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Prestasi</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {/* Judul Prestasi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Prestasi *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi *</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                        <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="International">International</option>
                            <option value="National">National</option>
                            <option value="Regional">Regional</option>
                        </select>
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    {/* Jenis Prestasi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jenis Prestasi *</label>
                        <select
                            value={data.achievement_type_id}
                            onChange={(e) => setData('achievement_type_id', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Pilih Jenis Prestasi</option>
                            {achievementTypes.map((type) => (
                                <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                            ))}
                        </select>
                        {errors.achievement_type_id && <p className="text-red-500 text-sm mt-1">{errors.achievement_type_id}</p>}
                    </div>

                    {/* Medali */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Medali</label>
                        <select
                            value={data.medal}
                            onChange={(e) => setData('medal', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tidak Ada</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                        {errors.medal && <p className="text-red-500 text-sm mt-1">{errors.medal}</p>}
                    </div>

                    {/* Nama Acara */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Acara *</label>
                        <input
                            type="text"
                            value={data.event_name}
                            onChange={(e) => setData('event_name', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.event_name && <p className="text-red-500 text-sm mt-1">{errors.event_name}</p>}
                    </div>

                    {/* Tanggal Acara */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal Acara *</label>
                        <input
                            type="date"
                            value={data.event_date}
                            onChange={(e) => setData('event_date', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {errors.event_date && <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end space-x-4">
                        <Link
                            href={route('admin.achievements.index')}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}