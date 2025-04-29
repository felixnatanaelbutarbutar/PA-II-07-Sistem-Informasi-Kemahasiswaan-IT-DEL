import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import React from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 text-red-800 rounded-lg">
                    <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
                    <p>Maaf, ada masalah saat memuat halaman. Silakan coba lagi.</p>
                    <Link
                        href={route('admin.form.index')}
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Kembali ke Daftar
                    </Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Edit({ auth, permissions, userRole, menu, scholarships, form }) {
    const { data, setData, post, processing, reset } = useForm({
        scholarship_id: form.scholarship_id || '',
        form_name: form.form_name || '',
        description: form.description || '',
        sections: form.sections.map((section) => ({
            title: section.title || '',
            fields: section.fields.map((field) => ({
                field_id: field.field_id || null,
                field_name: field.field_name || '',
                field_type: field.field_type || 'text',
                is_required: field.is_required,
                options: field.options || '',
                order: String(field.order),
                file: null,
                file_path: field.file_path || null,
            })),
        })) || [{
            title: '',
            fields: [{
                field_id: null,
                field_name: '',
                field_type: 'text',
                is_required: false,
                options: '',
                order: '1',
                file: null,
                file_path: null,
            }],
        }],
        updated_by: auth.user.id,
    });

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const addSection = () => {
        setData('sections', [
            ...data.sections,
            {
                title: '',
                fields: [{
                    field_id: null,
                    field_name: '',
                    field_type: 'text',
                    is_required: false,
                    options: '',
                    order: '1',
                    file: null,
                    file_path: null,
                }],
            },
        ]);
    };

    const updateSectionTitle = (sectionIndex, newTitle) => {
        const updatedSections = [...data.sections];
        updatedSections[sectionIndex].title = newTitle;
        setData('sections', updatedSections);
    };

    const deleteSection = (sectionIndex) => {
        if (data.sections.length > 1) {
            setData('sections', data.sections.filter((_, i) => i !== sectionIndex));
            const newErrors = { ...errors };
            delete newErrors[`sections.${sectionIndex}`];
            setErrors(newErrors);
        } else {
            setNotification({
                show: true,
                type: 'error',
                message: 'Formulir harus memiliki minimal satu bagian.',
            });
        }
    };

    const addField = (sectionIndex) => {
        const updatedSections = [...data.sections];
        const section = updatedSections[sectionIndex];
        section.fields.push({
            field_id: null,
            field_name: '',
            field_type: 'text',
            is_required: false,
            options: '',
            order: String(section.fields.length + 1),
            file: null,
            file_path: null,
        });
        setData('sections', updatedSections);
    };

    const updateField = (sectionIndex, fieldIndex, key, value) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];

        if (key === 'is_required') {
            field.is_required = value;
        } else if (key === 'order') {
            field.order = String(value);
        } else if (key === 'file') {
            field.file = value;
            if (value) field.file_path = null;
        } else if (key === 'field_type' && value !== 'dropdown') {
            field.field_type = value;
            field.options = '';
        } else {
            field[key] = value;
        }

        setData('sections', updatedSections);
        validateField(sectionIndex, fieldIndex, { ...field, [key]: value });
    };

    const addOption = (sectionIndex, fieldIndex) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];
        const options = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        options.push(`Opsi ${options.length + 1}`);
        field.options = options.join(', ');
        setData('sections', updatedSections);
        validateField(sectionIndex, fieldIndex, { ...field, options: options.join(', ') });
    };

    const updateOption = (sectionIndex, fieldIndex, optionIndex, value) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];
        const options = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        options[optionIndex] = value;
        field.options = options.join(', ');
        setData('sections', updatedSections);
        validateField(sectionIndex, fieldIndex, { ...field, options: options.join(', ') });
    };

    const deleteOption = (sectionIndex, fieldIndex, optionIndex) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];
        const options = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        if (options.length > 1) {
            options.splice(optionIndex, 1);
            field.options = options.join(', ');
            setData('sections', updatedSections);
            validateField(sectionIndex, fieldIndex, { ...field, options: options.join(', ') });
        }
    };

    const deleteField = (sectionIndex, fieldIndex) => {
        const updatedSections = [...data.sections];
        if (updatedSections[sectionIndex].fields.length > 1) {
            updatedSections[sectionIndex].fields = updatedSections[sectionIndex].fields
                .filter((_, i) => i !== fieldIndex)
                .map((field, i) => ({
                    ...field,
                    order: String(i + 1),
                }));
            setData('sections', updatedSections);
            const newErrors = { ...errors };
            delete newErrors[`sections.${sectionIndex}.fields.${fieldIndex}`];
            setErrors(newErrors);
        } else {
            setNotification({
                show: true,
                type: 'error',
                message: 'Setiap bagian harus memiliki minimal satu pertanyaan.',
            });
        }
    };

    const handleFileChange = (sectionIndex, fieldIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSizeInBytes) {
                setErrors((prev) => ({
                    ...prev,
                    [`sections.${sectionIndex}.fields.${fieldIndex}.file`]: 'Ukuran file terlalu besar. Maksimal 2MB.',
                }));
                updateField(sectionIndex, fieldIndex, 'file', null);
                return;
            }
            updateField(sectionIndex, fieldIndex, 'file', file);
        }
    };

    const validateField = (sectionIndex, fieldIndex, field) => {
        const newErrors = { ...errors };
        if (!field.field_name.trim()) {
            newErrors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`] = 'Pertanyaan wajib diisi.';
        } else {
            delete newErrors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`];
        }
        if (field.field_type === 'dropdown' && (!field.options || !field.options.trim())) {
            newErrors[`sections.${sectionIndex}.fields.${fieldIndex}.options`] = 'Opsi wajib diisi untuk pilihan ganda.';
        } else {
            delete newErrors[`sections.${sectionIndex}.fields.${fieldIndex}.options`];
        }
        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Client-side validation
        const newErrors = {};
        if (!data.scholarship_id) {
            newErrors.scholarship_id = 'Jenis beasiswa wajib dipilih.';
        }
        if (!data.form_name.trim()) {
            newErrors.form_name = 'Judul formulir wajib diisi.';
        }
        if (data.sections.length === 0) {
            newErrors.sections = 'Formulir harus memiliki minimal satu bagian.';
        }
        data.sections.forEach((section, sectionIndex) => {
            if (section.fields.length === 0) {
                newErrors[`sections.${sectionIndex}.fields`] = 'Setiap bagian harus memiliki minimal satu pertanyaan.';
            }
            section.fields.forEach((field, fieldIndex) => {
                if (!field.field_name.trim()) {
                    newErrors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`] = 'Pertanyaan wajib diisi.';
                }
                if (field.field_type === 'dropdown' && (!field.options || !field.options.trim())) {
                    newErrors[`sections.${sectionIndex}.fields.${fieldIndex}.options`] = 'Opsi wajib diisi untuk pilihan ganda.';
                }
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        post(route('admin.form.update', { form: form.form_id }), {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Formulir berhasil diperbarui!',
                });
                reset();
                setTimeout(() => {
                    window.location.href = route('admin.form.index');
                }, 1500);
            },
            onError: (serverErrors) => {
                setErrors(serverErrors);
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal memperbarui formulir: Periksa kembali isian Anda.',
                });
                setIsSubmitting(false);
            },
        });
    };

    return (
        <ErrorBoundary>
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title="Edit Formulir Beasiswa" />

                {/* Notification */}
                {notification.show && (
                    <div
                        className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                            notification.type === 'success'
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                                : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                        }`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className={`h-5 w-5 ${
                                        notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    {notification.type === 'success' ? (
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    ) : (
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V5z"
                                            clipRule="evenodd"
                                        />
                                    )}
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p
                                    className={`text-sm font-medium ${
                                        notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                    }`}
                                >
                                    {notification.message}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setNotification({ show: false, type: '', message: '' })}
                                    className={`inline-flex rounded-md p-1.5 ${
                                        notification.type === 'success'
                                            ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                                            : 'text-rose-500 hover:bg-rose-100 focus:ring-rose-500'
                                    } focus:outline-none focus:ring-2`}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg
                                        className="h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="py-12 max-w-5xl mx-auto px-6 sm:px-8">
                    {/* Styled Header */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Edit Formulir Beasiswa
                            </h1>
                            <p className="text-gray-500 mt-1">Perbarui formulir untuk pendaftaran beasiswa</p>
                        </div>
                        <Link
                            href={route('admin.form.index')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                        >
                            ← Kembali
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-8">
                        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data" noValidate>
                            {/* Form Header */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    Judul Formulir <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.form_name}
                                    onChange={(e) => {
                                        setData('form_name', e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            form_name: e.target.value.trim() ? undefined : 'Judul formulir wajib diisi.',
                                        }));
                                    }}
                                    className={`w-full px-4 py-3 border rounded-lg transition ${
                                        errors.form_name
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Masukkan judul formulir"
                                />
                                {errors.form_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.form_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi Formulir
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
                                    placeholder="Masukkan deskripsi formulir (opsional)"
                                    rows="3"
                                />
                            </div>

                            {/* Scholarship Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    Jenis Beasiswa <span className="text-red-500">*</span>
                                </label>
                                {scholarships.length > 0 ? (
                                    <select
                                        value={data.scholarship_id}
                                        onChange={(e) => {
                                            setData('scholarship_id', e.target.value);
                                            setErrors((prev) => ({
                                                ...prev,
                                                scholarship_id: e.target.value ? undefined : 'Jenis beasiswa wajib dipilih.',
                                            }));
                                        }}
                                        className={`w-full px-4 py-3 border rounded-lg transition ${
                                            errors.scholarship_id
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                    >
                                        <option value="">Pilih Jenis Beasiswa</option>
                                        {scholarships.map((scholarship) => (
                                            <option key={scholarship.scholarship_id} value={scholarship.scholarship_id}>
                                                {scholarship.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-red-500 text-sm">
                                        Tidak ada beasiswa tersedia. Silakan tambahkan beasiswa terlebih dahulu.
                                    </p>
                                )}
                                {errors.scholarship_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.scholarship_id}</p>
                                )}
                            </div>

                            {/* Fields */}
                            {data.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="bg-gray-50 rounded-lg p-6 mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                                className="w-full text-lg font-semibold text-gray-800 border rounded-lg px-4 py-3 transition border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Judul Bagian (opsional)"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => addField(sectionIndex)}
                                                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm flex items-center transition"
                                                    title="Tambahkan pertanyaan baru di dalam bagian ini"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                        />
                                                    </svg>
                                                    Tambah Pertanyaan
                                                </button>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Tambahkan pertanyaan baru dalam bagian ini.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => deleteSection(sectionIndex)}
                                                className="text-gray-500 hover:text-red-600"
                                                disabled={data.sections.length === 1}
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {section.fields.map((field, fieldIndex) => (
                                        <div key={fieldIndex} className="space-y-2 mb-4 border-b pb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-1/3">
                                                    <input
                                                        type="text"
                                                        value={field.field_name}
                                                        onChange={(e) =>
                                                            updateField(sectionIndex, fieldIndex, 'field_name', e.target.value)
                                                        }
                                                        className={`w-full text-sm font-medium text-gray-700 border rounded-lg px-4 py-3 transition ${
                                                            errors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`]
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                        placeholder="Masukkan pertanyaan"
                                                    />
                                                    {errors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`] && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`]}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="w-2/3">
                                                    <select
                                                        value={field.field_type}
                                                        onChange={(e) =>
                                                            updateField(sectionIndex, fieldIndex, 'field_type', e.target.value)
                                                        }
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                                                    >
                                                        <option value="text">Teks</option>
                                                        <option value="number">Angka</option>
                                                        <option value="date">Tanggal</option>
                                                        <option value="dropdown">Pilihan Ganda</option>
                                                        <option value="file">File</option>
                                                    </select>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteField(sectionIndex, fieldIndex)}
                                                    className="text-gray-500 hover:text-red-600"
                                                    disabled={section.fields.length === 1}
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            {field.field_type === 'dropdown' && (
                                                <div className="pl-1/3">
                                                    {(field.options ? field.options.split(',').map(opt => opt.trim()) : []).map(
                                                        (option, optIndex) => (
                                                            <div key={optIndex} className="flex items-center space-x-2 mb-2">
                                                                <input
                                                                    type="radio"
                                                                    disabled
                                                                    className="h-4 w-4 text-blue-600 border-gray-300"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) =>
                                                                        updateOption(sectionIndex, fieldIndex, optIndex, e.target.value)
                                                                    }
                                                                    className={`flex-1 px-4 py-2 border rounded-lg transition ${
                                                                        errors[
                                                                            `sections.${sectionIndex}.fields.${fieldIndex}.options`
                                                                        ]
                                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                    }`}
                                                                    placeholder={`Opsi ${optIndex + 1}`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteOption(sectionIndex, fieldIndex, optIndex)}
                                                                    className="text-gray-500 hover:text-red-600"
                                                                    disabled={field.options.split(',').length === 1}
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                    {errors[`sections.${sectionIndex}.fields.${fieldIndex}.options`] && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors[`sections.${sectionIndex}.fields.${fieldIndex}.options`]}
                                                        </p>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => addOption(sectionIndex, fieldIndex)}
                                                        className="text-blue-600 hover:underline text-sm flex items-center mt-2"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mr-1"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                        Tambahkan Opsi
                                                    </button>
                                                </div>
                                            )}

                                            {field.field_type === 'file' && (
                                                <div className="pl-1/3">
                                                    <input
                                                        type="file"
                                                        name={`sections[${sectionIndex}][fields][${fieldIndex}][file]`}
                                                        onChange={(e) => handleFileChange(sectionIndex, fieldIndex, e)}
                                                        className={`w-full px-4 py-3 border rounded-lg transition ${
                                                            errors[`sections.${sectionIndex}.fields.${fieldIndex}.file`]
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {field.file_path && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            File saat ini: {field.file_path.split('/').pop()}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Format yang didukung: PDF, DOC, JPG, PNG. Ukuran maksimal: 2MB
                                                    </p>
                                                    {errors[`sections.${sectionIndex}.fields.${fieldIndex}.file`] && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors[`sections.${sectionIndex}.fields.${fieldIndex}.file`]}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={field.is_required}
                                                    onChange={(e) =>
                                                        updateField(sectionIndex, fieldIndex, 'is_required', e.target.checked)
                                                    }
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">Wajib Diisi</label>
                                            </div>

                                            <div className="flex items-center mt-2">
                                                <label className="text-sm text-gray-700 mr-2">Urutan</label>
                                                <input
                                                    type="text"
                                                    value={field.order}
                                                    onChange={(e) =>
                                                        updateField(sectionIndex, fieldIndex, 'order', e.target.value)
                                                    }
                                                    className="w-16 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {errors[`sections.${sectionIndex}.fields`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`sections.${sectionIndex}.fields`]}</p>
                                    )}
                                </div>
                            ))}

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm flex items-center transition"
                                    title="Tambahkan bagian baru untuk mengelompokkan pertanyaan"
                                >
                                    <svg
                                        className="w-5 h-5 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Tambah Bagian Baru
                                </button>
                                <p className="text-xs text-gray-500 mt-1">
                                    Bagian baru memungkinkan Anda mengelompokkan pertanyaan terkait. Anda dapat menggunakan satu bagian tanpa judul jika tidak diperlukan.
                                </p>
                            </div>

                            {errors.sections && (
                                <p className="text-red-500 text-xs mt-1">{errors.sections}</p>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 pt-4 border-t">
                                <Link
                                    href={route('admin.form.index')}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting || scholarships.length === 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        </ErrorBoundary>
    );
}
import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react'; // Import route directly
import AdminLayout from '@/Layouts/AdminLayout';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 text-red-800 rounded-lg">
                    <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
                    <p>Maaf, ada masalah saat memuat halaman. Silakan coba lagi.</p>
                    <Link
                        href={route('admin.form.index')} // Use route directly
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Kembali ke Daftar
                    </Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Edit({ auth, permissions, userRole, menu, scholarships, form }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        scholarship_id: form.scholarship_id || '',
        form_name: form.form_name || 'Judul Form',
        description: form.description || 'Deskripsi Form',
        sections: form.sections.map((section) => ({
            title: section.title,
            fields: section.fields.map((field) => ({
                field_id: field.field_id || null,
                field_name: field.field_name || '',
                field_type: field.field_type || 'text',
                is_required: field.is_required, // Already boolean from controller
                options: field.options || null,
                order: String(field.order),
                file: null,
                file_path: field.file_path || null,
            })),
        })) || [],
        created_by: form.created_by || auth.user.id,
        updated_by: auth.user.id,
    });

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        console.log('Scholarships:', scholarships);
        console.log('Processing:', processing);
        console.log('Form Data:', data);

        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, scholarships, processing, data]);

    const addSection = () => {
        setData('sections', [
            ...data.sections,
            {
                title: `Bagian Baru ${data.sections.length + 1}`,
                fields: [],
            },
        ]);
    };

    const updateSectionTitle = (sectionIndex, newTitle) => {
        const updatedSections = [...data.sections];
        updatedSections[sectionIndex].title = newTitle;
        setData('sections', updatedSections);
    };

    const deleteSection = (sectionIndex) => {
        setData('sections', data.sections.filter((_, i) => i !== sectionIndex));
    };

    const addField = (sectionIndex) => {
        const updatedSections = [...data.sections];
        const section = updatedSections[sectionIndex];
        section.fields.push({
            field_id: null,
            field_name: 'Pertanyaan Tanpa Judul',
            field_type: 'text',
            is_required: false,
            options: null,
            order: String(section.fields.length + 1),
            file: null,
            file_path: null,
        });
        setData('sections', updatedSections);
    };

    const updateField = (sectionIndex, fieldIndex, key, value) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];

        if (key === 'is_required') {
            field.is_required = value;
        } else if (key === 'order') {
            field.order = String(value);
        } else if (key === 'file') {
            field.file = value;
            if (value) field.file_path = null;
        } else if (key === 'field_type') {
            field.field_type = value;
            if (value !== 'dropdown') field.options = null;
        } else {
            field[key] = value;
        }

        setData('sections', updatedSections);
    };

    const addOption = (sectionIndex, fieldIndex) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];
        const options = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        options.push(`Opsi ${options.length + 1}`);
        field.options = options.join(', ');
        setData('sections', updatedSections);
    };

    const updateOption = (sectionIndex, fieldIndex, optionIndex, value) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];
        const options = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        options[optionIndex] = value;
        field.options = options.join(', ');
        setData('sections', updatedSections);
    };

    const deleteOption = (sectionIndex, fieldIndex, optionIndex) => {
        const updatedSections = [...data.sections];
        const field = updatedSections[sectionIndex].fields[fieldIndex];
        const options = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        if (options.length > 1) {
            options.splice(optionIndex, 1);
            field.options = options.join(', ');
            setData('sections', updatedSections);
        }
    };

    const deleteField = (sectionIndex, fieldIndex) => {
        const updatedSections = [...data.sections];
        updatedSections[sectionIndex].fields = updatedSections[sectionIndex].fields
            .filter((_, i) => i !== fieldIndex)
            .map((field, i) => ({
                ...field,
                order: String(i + 1),
            }));
        setData('sections', updatedSections);
    };

    const handleFileChange = (sectionIndex, fieldIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            updateField(sectionIndex, fieldIndex, 'file', file);
        }
    };

    const handleQuillChange = (sectionIndex, fieldIndex, value) => {
        updateField(sectionIndex, fieldIndex, 'value', value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Submitting form with data:', data);

        // Use the form.update route with form_id
        const updateUrl = route('admin.form.update', { form: form.form_id }) || `/admin/form/${form.form_id}/update`;

        post(updateUrl, {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true, // Ensure files are sent as multipart/form-data
            onSuccess: () => {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Formulir berhasil diperbarui!',
                });
                setTimeout(() => {
                    window.location.href = route('admin.form.index'); // Use route directly
                }, 1500);
            },
            onError: (err) => {
                console.error('Form submission errors:', err);
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal memperbarui formulir: Periksa kembali isian Anda.',
                });
            },
            onFinish: () => {
                reset();
            },
        });
    };

    return (
        <ErrorBoundary>
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title="Edit Formulir Beasiswa" />

                {notification.show && (
                    <div
                        className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                            notification.type === 'success'
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                                : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                        }`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className={`h-5 w-5 ${
                                        notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    {notification.type === 'success' ? (
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    ) : (
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V5z"
                                            clipRule="evenodd"
                                        />
                                    )}
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p
                                    className={`text-sm font-medium ${
                                        notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                    }`}
                                >
                                    {notification.message}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setNotification({ show: false, type: '', message: '' })}
                                    className={`inline-flex rounded-md p-1.5 ${
                                        notification.type === 'success'
                                            ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                                            : 'text-rose-500 hover:bg-rose-100 focus:ring-rose-500'
                                    } focus:outline-none focus:ring-2`}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg
                                        className="h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {scholarships.length === 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-yellow-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Tidak ada beasiswa tersedia. Silakan tambahkan beasiswa terlebih dahulu untuk mengaktifkan tombol simpan.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="py-12 max-w-4xl mx-auto px-6 sm:px-8">
                    <div className="bg-white rounded-t-lg border-t-8 border-blue-600 shadow-md">
                        <input
                            type="text"
                            value={data.form_name}
                            onChange={(e) => setData('form_name', e.target.value)}
                            className="w-full px-6 py-4 text-2xl font-semibold text-blue-800 border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                            placeholder="Formulir Tanpa Judul"
                        />
                        {errors.form_name && (
                            <p className="text-red-500 text-xs px-6 pb-2">{errors.form_name}</p>
                        )}
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full px-6 py-2 text-gray-600 border-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
                            placeholder="Deskripsi formulir"
                            rows="2"
                        />
                    </div>

                    <div className="bg-white rounded-b-lg shadow-md mt-4 p-6">
                        <div className="flex items-center space-x-4">
                            <label className="block text-sm font-medium text-gray-700 w-1/3">
                                Jenis Beasiswa <span className="text-red-500">*</span>
                            </label>
                            <div className="w-2/3">
                                {scholarships.length > 0 ? (
                                    <select
                                        value={data.scholarship_id}
                                        onChange={(e) => setData('scholarship_id', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                            errors.scholarship_id
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    >
                                        <option value="">Pilih Jenis Beasiswa</option>
                                        {scholarships.map((scholarship) => (
                                            <option key={scholarship.scholarship_id} value={scholarship.scholarship_id}>
                                                {scholarship.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-red-500 text-sm">
                                        Tidak ada beasiswa tersedia. Silakan tambahkan beasiswa terlebih dahulu.
                                    </p>
                                )}
                                {errors.scholarship_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.scholarship_id}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-4" encType="multipart/form-data" noValidate>
                        {data.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                        className="text-lg font-semibold text-gray-800 border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                                        placeholder="Judul Bagian"
                                    />
                                    {errors[`sections.${sectionIndex}.title`] && (
                                        <p className="text-red-500 text-xs">{errors[`sections.${sectionIndex}.title`]}</p>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => addField(sectionIndex)}
                                            className="text-blue-600 hover:underline text-sm flex items-center"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                />
                                            </svg>
                                            Tambah Pertanyaan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteSection(sectionIndex)}
                                            className="text-gray-500 hover:text-red-600"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {section.fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="space-y-2 mb-4 border-b pb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-1/3">
                                                <input
                                                    type="text"
                                                    value={field.field_name}
                                                    onChange={(e) =>
                                                        updateField(sectionIndex, fieldIndex, 'field_name', e.target.value)
                                                    }
                                                    className={`w-full text-sm font-medium text-gray-700 border-0 focus:outline-none focus:ring-0 placeholder-gray-400 ${
                                                        errors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`]
                                                            ? 'border-b-2 border-red-500'
                                                            : ''
                                                    }`}
                                                    placeholder="Pertanyaan Tanpa Judul"
                                                />
                                                {errors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`sections.${sectionIndex}.fields.${fieldIndex}.field_name`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-2/3">
                                                <select
                                                    value={field.field_type}
                                                    onChange={(e) =>
                                                        updateField(sectionIndex, fieldIndex, 'field_type', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="text">Teks</option>
                                                    <option value="number">Angka</option>
                                                    <option value="date">Tanggal</option>
                                                    <option value="dropdown">Pilihan Ganda</option>
                                                    <option value="file">File</option>
                                                    <option value="quill">Teks Panjang (Quill)</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => deleteField(sectionIndex, fieldIndex)}
                                                className="text-gray-500 hover:text-red-600"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        {field.field_type === 'dropdown' && (
                                            <div className="pl-1/3">
                                                {(field.options ? field.options.split(',').map(opt => opt.trim()) : []).map(
                                                    (option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center space-x-2 mb-2">
                                                            <input
                                                                type="radio"
                                                                disabled
                                                                className="h-4 w-4 text-blue-600 border-gray-300"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) =>
                                                                    updateOption(sectionIndex, fieldIndex, optIndex, e.target.value)
                                                                }
                                                                className={`flex-1 px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 ${
                                                                    errors[
                                                                        `sections.${sectionIndex}.fields.${fieldIndex}.options`
                                                                    ]
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }`}
                                                                placeholder={`Opsi ${optIndex + 1}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteOption(sectionIndex, fieldIndex, optIndex)}
                                                                className="text-gray-500 hover:text-red-600"
                                                                disabled={
                                                                    (field.options
                                                                        ? field.options.split(',').length
                                                                        : 0) <= 1
                                                                }
                                                            >
                                                                <svg
                                                                    className="w-5 h-5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                                {errors[`sections.${sectionIndex}.fields.${fieldIndex}.options`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`sections.${sectionIndex}.fields.${fieldIndex}.options`]}
                                                    </p>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => addOption(sectionIndex, fieldIndex)}
                                                    className="text-blue-600 hover:underline text-sm flex items-center mt-2"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                        />
                                                    </svg>
                                                    Tambahkan Opsi
                                                </button>
                                            </div>
                                        )}

                                        {field.field_type === 'file' && (
                                            <div className="pl-1/3">
                                                <input
                                                    type="file"
                                                    name={`sections[${sectionIndex}][fields][${fieldIndex}][file]`}
                                                    onChange={(e) => handleFileChange(sectionIndex, fieldIndex, e)}
                                                    className="mt-2"
                                                />
                                                {field.file_path && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        File saat ini: {field.file_path.split('/').pop()}
                                                    </p>
                                                )}
                                                {errors[`sections.${sectionIndex}.fields.${fieldIndex}.file`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`sections.${sectionIndex}.fields.${fieldIndex}.file`]}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {field.field_type === 'quill' && (
                                            <div className="pl-1/3">
                                                <ReactQuill
                                                    value={field.value || ''}
                                                    onChange={(value) => handleQuillChange(sectionIndex, fieldIndex, value)}
                                                    className="bg-white"
                                                />
                                                {errors[`sections.${sectionIndex}.fields.${fieldIndex}.value`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`sections.${sectionIndex}.fields.${fieldIndex}.value`]}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                checked={field.is_required}
                                                onChange={(e) =>
                                                    updateField(sectionIndex, fieldIndex, 'is_required', e.target.checked)
                                                }
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">Wajib Diisi</label>
                                        </div>

                                        <div className="flex items-center mt-2">
                                            <label className="text-sm text-gray-700 mr-2">Urutan</label>
                                            <input
                                                type="text"
                                                value={field.order}
                                                onChange={(e) =>
                                                    updateField(sectionIndex, fieldIndex, 'order', e.target.value)
                                                }
                                                className="w-16 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={addSection}
                                className="text-blue-600 hover:underline text-sm flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Bagian Baru
                            </button>
                        </div>

                        {errors.sections && (
                            <p className="text-red-500 text-sm mt-2">{errors.sections}</p>
                        )}

                        <div className="flex justify-end space-x-4 mt-6">
                            <Link
                                href={route('admin.form.index')} // Use route directly
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={processing || scholarships.length === 0}
                            >
                                {processing ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ErrorBoundary>
    );
}
