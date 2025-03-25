import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Add({ auth, permissions, userRole, menu, categories }) {
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        news_id: '',
        title: '',
        content: '',
        category_id: '',
        image: null,
        created_by: auth.user.id,
        updated_by: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.news.store'), {
            onSuccess: () => {
                reset();
                setImagePreview(null);
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Tambah Berita Baru" />
            <div className="py-10 max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tambah Berita Baru</h1>
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Berita *</label>
                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                        <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
                            <option value="">Pilih Kategori</option>
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gambar Berita</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mt-2" />}
                        {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Konten Berita *</label>
                        <ReactQuill value={data.content} onChange={content => setData('content', content)} className="bg-white" />
                        {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('admin.news.index')} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</Link>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                            {processing ? 'Processing...' : 'Simpan Berita'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
