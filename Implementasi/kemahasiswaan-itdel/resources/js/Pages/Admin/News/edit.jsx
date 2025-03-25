import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

export default function Edit({ auth, permissions, userRole, menu, categories, news }) {
    if (!auth?.user || !news) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    const [imagePreview, setImagePreview] = useState(news?.image ? `/storage/${news.image}` : null);
    const [data, setData] = useState({
        news_id: news.news_id,
        title: news.title,
        content: news.content,
        category_id: news.category_id,
        image: null,
        updated_by: auth.user.id,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        // Auto-hide notification after 5 seconds
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('_method', 'PUT'); // Spoofing metode PUT
        formData.append('news_id', data.news_id);
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('category_id', data.category_id);
        formData.append('updated_by', data.updated_by);

        if (data.image) {
            formData.append('image', data.image);
        }

        try {
            await axios.post(route('admin.news.update', news.news_id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Show success notification
            setNotification({
                show: true,
                type: 'success',
                message: 'Berita berhasil diperbarui!'
            });
            
            // Redirect after a short delay for better UX
            setTimeout(() => {
                router.visit(route('admin.news.index'));
            }, 1500);
            
        } catch (error) {
            console.error(error);
            
            // Show error notification
            setNotification({
                show: true,
                type: 'error',
                message: 'Gagal memperbarui berita. Silakan coba lagi.'
            });
            
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData(prevData => ({ ...prevData, image: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(news?.image ? `/storage/${news.image}` : null);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Berita" />
            
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 max-w-md px-6 py-4 rounded-lg shadow-lg transition-all transform animate-slide-in-right ${
                    notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                }`}>
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {notification.type === 'success' ? (
                                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setNotification({ ...notification, show: false })}
                                    className={`inline-flex rounded-md p-1.5 focus:outline-none ${
                                        notification.type === 'success' 
                                            ? 'text-green-500 hover:bg-green-100' 
                                            : 'text-red-500 hover:bg-red-100'
                                    }`}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="py-12 max-w-5xl mx-auto px-6 sm:px-8">
                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Edit Berita</h1>
                        <Link 
                            href={route('admin.news.index')} 
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                        >
                            ← Kembali
                        </Link>
                    </div>
                    
                    <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" className="space-y-6">
                        <input type="hidden" name="_method" value="PUT" />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Judul Berita <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={data.title} 
                                onChange={e => setData(prev => ({ ...prev, title: e.target.value }))} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                                placeholder="Masukkan judul berita"
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Kategori <span className="text-red-500">*</span></label>
                            <select 
                                value={data.category_id} 
                                onChange={e => setData(prev => ({ ...prev, category_id: e.target.value }))} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Gambar Berita</label>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="relative border border-gray-300 rounded-lg px-4 py-3">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            className="w-full cursor-pointer" 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Format yang didukung: JPG, PNG. Ukuran maksimal: 2MB</p>
                                </div>
                                {imagePreview && (
                                    <div className="relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setData(prev => ({ ...prev, image: null }));
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Konten Berita <span className="text-red-500">*</span></label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <ReactQuill 
                                    value={data.content} 
                                    onChange={content => setData(prev => ({ ...prev, content }))} 
                                    className="bg-white" 
                                    style={{ height: '300px' }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Minimum 50 karakter</p>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link 
                                href={route('admin.news.index')} 
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </Link>
                            <button 
                                type="submit" 
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                        Memperbarui...
                                    </>
                                ) : 'Update Berita'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}