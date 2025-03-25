import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Edit({ auth, permissions, userRole, menu, categories, announcement }) {
    if (!auth?.user || !announcement) {
        return <div>Loading...</div>;
    }

    const [filePreview, setFilePreview] = useState(announcement?.file ? `/storage/${announcement.file}` : null);

    const { data, setData, processing, errors, reset } = useForm({
        announcement_id: announcement.announcement_id,
        title: announcement.title,
        content: announcement.content,
        category_id: announcement.category_id,
        file: null,
        updated_by: auth.user.id,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('admin.announcement.update', announcement.announcement_id), data, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                reset();
                setFilePreview(null);
            },
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('file', file);
        if (file) {
            if (file.type === "application/pdf") {
                setFilePreview(URL.createObjectURL(file));
            } else {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFilePreview(announcement?.file ? `/storage/${announcement.file}` : null);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Pengumuman" />
            <div className="py-10 max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Pengumuman</h1>
                <form
                    onSubmit={handleSubmit}
                    action={route('admin.announcement.update', announcement.announcement_id)}
                    method="POST"
                    className="bg-white rounded-xl shadow-lg p-6 space-y-6"
                >
                    <input type="hidden" name="_method" value="PUT" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Pengumuman *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        />
                        {errors?.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                        <select
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        {errors?.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">File Pengumuman</label>
                        <input
                            type="file"
                            accept="image/*, application/pdf"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                        {filePreview && (
                            filePreview.includes('application/pdf') || filePreview.endsWith('.pdf') ? (
                                <a
                                    href={filePreview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 mt-2 block"
                                >
                                    Lihat PDF
                                </a>
                            ) : (
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover mt-2"
                                />
                            )
                        )}
                        {errors?.file && <p className="text-red-500 text-sm">{errors.file}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Konten Pengumuman *</label>
                        <ReactQuill
                            value={data.content}
                            onChange={(content) => setData('content', content)}
                            className="bg-white"
                        />
                        {errors?.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('admin.announcement.index')} className="px-4 py-2 bg-gray-200 rounded-lg">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            {processing ? 'Processing...' : 'Update Pengumuman'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
