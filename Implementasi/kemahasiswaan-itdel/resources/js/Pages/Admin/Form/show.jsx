import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import React, { useState, useEffect } from 'react';
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
                    <p>Maaf, ada masalah saat memuat pratinjau formulir. Silakan coba lagi.</p>
                    <Link
                        href={route('admin.form.index')}
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Kembali ke Daftar
                    </Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Show({ auth, permissions, userRole, menu, form, scholarships }) {
    // State untuk halaman saat ini (section)
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    // State untuk menyimpan input pengguna
    const [formData, setFormData] = useState(
        form.sections.reduce((acc, section, sectionIndex) => {
            section.fields.forEach((field, fieldIndex) => {
                acc[`sections.${sectionIndex}.fields.${fieldIndex}`] = field.field_type === 'file' ? null : '';
            });
            return acc;
        }, {})
    );
    // State untuk menyimpan pratinjau gambar
    const [imagePreviews, setImagePreviews] = useState({});
    // State untuk pesan error validasi
    const [errors, setErrors] = useState({});
    // State untuk modal berhasil
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Efek untuk menutup modal setelah 5 detik
    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                setShowSuccessModal(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);

    // Fungsi untuk merender field berdasarkan tipe
    const renderFieldPreview = (field, sectionIndex, fieldIndex) => {
        const fieldKey = `sections.${sectionIndex}.fields.${fieldIndex}`;
        const isRequired = field.is_required ? <span className="text-red-500 ml-1">*</span> : null;

        const handleChange = (value) => {
            setFormData((prev) => ({ ...prev, [fieldKey]: value }));
            if (field.is_required && !value) {
                setErrors((prev) => ({
                    ...prev,
                    [fieldKey]: 'Kolom ini wajib diisi.',
                }));
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldKey];
                    return newErrors;
                });
            }
        };

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg',
                    'image/png',
                ];
                if (file.size > maxSizeInBytes) {
                    setErrors((prev) => ({
                        ...prev,
                        [fieldKey]: 'Ukuran file terlalu besar. Maksimal 2MB.',
                    }));
                    return;
                }
                if (!allowedTypes.includes(file.type)) {
                    setErrors((prev) => ({
                        ...prev,
                        [fieldKey]: 'File harus berupa PDF, DOC, DOCX, JPG, atau PNG.',
                    }));
                    return;
                }
                setFormData((prev) => ({ ...prev, [fieldKey]: file }));
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        setImagePreviews((prev) => ({ ...prev, [fieldKey]: reader.result }));
                    };
                    reader.readAsDataURL(file);
                } else {
                    setImagePreviews((prev) => {
                        const newPreviews = { ...prev };
                        delete newPreviews[fieldKey];
                        return newPreviews;
                    });
                }
                if (field.is_required) {
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[fieldKey];
                        return newErrors;
                    });
                }
            }
        };

        switch (field.field_type) {
            case 'text':
                return (
                    <div>
                        <input
                            type="text"
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Teks singkat"
                        />
                        {errors[fieldKey] && (
                            <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>
                        )}
                    </div>
                );
            case 'number':
                return (
                    <div>
                        <input
                            type="number"
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Angka"
                        />
                        {errors[fieldKey] && (
                            <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>
                        )}
                    </div>
                );
            case 'date':
                return (
                    <div>
                        <input
                            type="date"
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            }`}
                        />
                        {errors[fieldKey] && (
                            <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>
                        )}
                    </div>
                );
            case 'dropdown':
                return (
                    <div>
                        <select
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            }`}
                        >
                            <option value="">Pilih opsi</option>
                            {field.options &&
                                field.options.split(',').map((option, index) => (
                                    <option key={`${fieldKey}.option.${index}`} value={option.trim()}>
                                        {option.trim()}
                                    </option>
                                ))}
                        </select>
                        {errors[fieldKey] && (
                            <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>
                        )}
                    </div>
                );
            case 'file':
                return (
                    <div>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 2MB
                        </p>
                        {imagePreviews[fieldKey] && (
                            <div className="mt-2">
                                <img
                                    src={imagePreviews[fieldKey]}
                                    alt="Pratinjau Gambar"
                                    className="max-w-xs rounded-lg shadow-sm"
                                />
                            </div>
                        )}
                        {errors[fieldKey] && (
                            <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>
                        )}
                    </div>
                );
            case 'quill':
                return (
                    <div>
                        <ReactQuill
                            value={formData[fieldKey] || ''}
                            onChange={handleChange}
                            className={errors[fieldKey] ? 'border border-red-500 rounded-lg' : ''}
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ['bold', 'italic', 'underline'],
                                    ['link'],
                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                    ['clean'],
                                ],
                            }}
                        />
                        {errors[fieldKey] && (
                            <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // Fungsi untuk navigasi antar section
    const handleNext = () => {
        const currentSection = form.sections[currentSectionIndex];
        const newErrors = {};
        let hasError = false;

        // Validasi field wajib
        currentSection.fields.forEach((field, fieldIndex) => {
            const fieldKey = `sections.${currentSectionIndex}.fields.${fieldIndex}`;
            if (field.is_required && !formData[fieldKey]) {
                newErrors[fieldKey] = 'Kolom ini wajib diisi.';
                hasError = true;
            }
        });

        setErrors(newErrors);
        if (!hasError && currentSectionIndex < form.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    // Fungsi untuk menangani pengiriman (simulasi)
    const handleSubmit = () => {
        const currentSection = form.sections[currentSectionIndex];
        const newErrors = {};
        let hasError = false;

        // Validasi field wajib
        currentSection.fields.forEach((field, fieldIndex) => {
            const fieldKey = `sections.${currentSectionIndex}.fields.${fieldIndex}`;
            if (field.is_required && !formData[fieldKey]) {
                newErrors[fieldKey] = 'Kolom ini wajib diisi.';
                hasError = true;
            }
        });

        setErrors(newErrors);
        if (!hasError) {
            setShowSuccessModal(true);
            // Reset form untuk simulasi
            setFormData(
                form.sections.reduce((acc, section, sectionIndex) => {
                    section.fields.forEach((field, fieldIndex) => {
                        acc[`sections.${sectionIndex}.fields.${fieldIndex}`] = field.field_type === 'file' ? null : '';
                    });
                    return acc;
                }, {})
            );
            setImagePreviews({});
            setCurrentSectionIndex(0);
        }
    };

    return (
        <ErrorBoundary>
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
                <Head title={`Pratinjau Formulir: ${form.form_name}`} />

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all animate-fade-in">
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-green-100 rounded-full p-3">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 text-center">
                                Percobaan Berhasil!
                            </h3>
                            <p className="text-gray-600 text-center mt-2">
                                Percobaan berhasil dan tidak tersimpan ke database.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="py-12 max-w-4xl mx-auto px-6 sm:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{form.form_name}</h1>
                            {form.description && (
                                <p className="text-gray-600 mt-1 text-sm">{form.description}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.form.index')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                            >
                                ← Kembali
                            </Link>
                            <Link
                                href={route('admin.form.edit', form.form_id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                Edit
                                <svg
                                    className="w-5 h-5 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657 1.414 1.414-5.657L18.586 2.586z"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Form Preview - Hanya satu section per halaman */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-100">
                            {form.sections[currentSectionIndex].title && (
                                <div className="bg-gray-50 px-8 py-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {form.sections[currentSectionIndex].title}
                                    </h3>
                                </div>
                            )}
                            <div className="p-8 space-y-6">
                                {form.sections[currentSectionIndex].fields
                                    .sort((a, b) => a.order - b.order)
                                    .map((field, fieldIndex) => (
                                        <div
                                            key={field.field_id || `${currentSectionIndex}-${fieldIndex}`}
                                            className="grid md:grid-cols-3 grid-cols-1 gap-4 items-start"
                                        >
                                            {/* Label di kiri */}
                                            <label className="md:col-span-1 text-sm font-medium text-gray-700 pt-3">
                                                {field.field_name}
                                                {field.is_required && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </label>
                                            {/* Input di kanan */}
                                            <div className="md:col-span-2">
                                                {renderFieldPreview(field, currentSectionIndex, fieldIndex)}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentSectionIndex === 0}
                            className={`px-6 py-3 rounded-lg transition flex items-center ${
                                currentSectionIndex === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-label="Halaman Sebelumnya"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Sebelumnya
                        </button>
                        <div className="flex items-center space-x-4">
                            {currentSectionIndex < form.sections.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                                    aria-label="Halaman Berikutnya"
                                >
                                    Berikutnya
                                    <svg
                                        className="w-5 h-5 ml-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                                    aria-label="Kirim Formulir"
                                >
                                    Kirim
                                    <svg
                                        className="w-5 h-5 ml-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ErrorBoundary>
    );
}
