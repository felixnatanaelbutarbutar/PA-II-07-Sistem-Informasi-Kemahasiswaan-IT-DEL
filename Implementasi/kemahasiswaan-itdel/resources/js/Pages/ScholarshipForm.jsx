import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import debounce from 'lodash/debounce';

export default function ScholarshipForm() {
    const { form, scholarship, submission, auth = {}, userRole, flash } = usePage().props;
    const isMahasiswa = userRole === 'mahasiswa';
    const isAuthenticated = !!auth?.user;
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [formData, setFormData] = useState(() => {
        const initialData = {};
        form?.sections?.forEach((section, sectionIndex) => {
            section.fields.forEach((field, fieldIndex) => {
                const fieldKey = `sections.${sectionIndex}.fields.${fieldIndex}`;
                initialData[fieldKey] = field.field_type === 'file' ? null : '';
            });
        });
        if (submission?.data && form?.allow_edit) {
            Object.keys(submission.data).forEach((key) => {
                initialData[key] = submission.data[key];
            });
        }
        return initialData;
    });
    const [imagePreviews, setImagePreviews] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(!!submission);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    // Debounced function to check submission status
    const checkSubmissionStatus = useCallback(
        debounce(async () => {
            if (isMahasiswa && form?.form_id && isAuthenticated && !submission) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`/api/forms/submissions?form_id=${form.form_id}`, {
                        headers: {
                            Authorization: `Bearer ${auth?.user?.token || ''}`,
                        },
                    });
                    const submissions = response.data.submissions || [];
                    setHasSubmitted(submissions.some((s) => s.form_id === form.form_id));
                } catch (err) {
                    setErrors({ api: 'Gagal memuat status pengiriman formulir' });
                    console.error('Error fetching submissions:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        }, 500),
        [isMahasiswa, form?.form_id, isAuthenticated, auth?.user?.token, submission]
    );

    // Check submission status only once on mount
    useEffect(() => {
        checkSubmissionStatus();
        return () => checkSubmissionStatus.cancel(); // Cleanup debounce on unmount
    }, [checkSubmissionStatus]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
        if (flash?.error || errors.api) {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    }, [flash, errors.api]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Handle field input change
    const handleFieldChange = (fieldKey, value, field) => {
        setFormData((prev) => ({ ...prev, [fieldKey]: value }));
        if (field?.is_required && !value) {
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

    // Handle file input change
    const handleFileChange = (fieldKey, file, field) => {
        if (file) {
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
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
                    [fieldKey]: 'File harus berupa PDF, JPG, atau PNG.',
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

    // Handle Quill editor change
    const handleQuillChange = (fieldKey, value, field) => {
        setFormData((prev) => ({ ...prev, [fieldKey]: value }));
        if (field.is_required && (!value || value === '<p><br></p>')) {
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

    // Validate form before submission
    const validateForm = () => {
        const newErrors = {};
        form.sections.forEach((section, sectionIndex) => {
            section.fields.forEach((field, fieldIndex) => {
                const fieldKey = `sections.${sectionIndex}.fields.${fieldIndex}`;
                const value = formData[fieldKey];
                if (field.is_required) {
                    if (!value || (field.field_type === 'quill' && value === '<p><br></p>')) {
                        newErrors[fieldKey] = 'Kolom ini wajib diisi.';
                    }
                    if (field.field_type === 'file' && !value && !submission?.data?.[fieldKey]) {
                        newErrors[fieldKey] = 'File wajib diunggah.';
                    }
                }
            });
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission or update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        setIsLoading(true);
        const formPayload = new FormData();
        formPayload.append('form_id', form.form_id);
        formPayload.append('scholarship_id', scholarship.scholarship_id);

        const data = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] instanceof File) {
                formPayload.append(`data[${key}]`, formData[key]);
            } else {
                data[key] = formData[key];
            }
        });
        formPayload.append('data', JSON.stringify(data));

        try {
            const url = submission && form.allow_edit
                ? `/api/forms/submissions/${submission.submission_id}`
                : '/api/forms/submissions';
            const method = submission && form.allow_edit ? 'put' : 'post';

            const response = await axios({
                method,
                url,
                data: formPayload,
                headers: {
                    Authorization: `Bearer ${auth.user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setShowSuccess(true);
            setHasSubmitted(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.visit(`/student/scholarships/${scholarship.scholarship_id}`);
            }, 2000);
        } catch (error) {
            setIsLoading(false);
            const errorMessage = error.response?.data?.message || 'Gagal mengirim formulir';
            const fieldErrors = error.response?.data?.errors || {};
            setErrors({ api: errorMessage, ...fieldErrors });
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            console.error('Submission error:', error);
        }
    };

    // Handle logout
    const handleLogout = () => {
        router.post('/logout');
    };

    // Render field based on type
    const renderField = (field, sectionIndex, fieldIndex) => {
        const fieldKey = `sections.${sectionIndex}.fields.${fieldIndex}`;
        const isRequired = field.is_required ? <span className="text-red-500 ml-1">*</span> : null;
        const isDisabled = hasSubmitted && !form?.allow_edit;

        switch (field.field_type) {
            case 'text':
                return (
                    <div>
                        <input
                            type="text"
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleFieldChange(fieldKey, e.target.value, field)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            } bg-gray-50 disabled:bg-gray-100`}
                            placeholder="Masukkan teks"
                            disabled={isDisabled}
                        />
                        {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
                    </div>
                );
            case 'number':
                return (
                    <div>
                        <input
                            type="number"
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleFieldChange(fieldKey, e.target.value, field)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            } bg-gray-50 disabled:bg-gray-100`}
                            placeholder="Masukkan angka"
                            disabled={isDisabled}
                        />
                        {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
                    </div>
                );
            case 'date':
                return (
                    <div>
                        <input
                            type="date"
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleFieldChange(fieldKey, e.target.value, field)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            } bg-gray-50 disabled:bg-gray-100`}
                            disabled={isDisabled}
                        />
                        {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
                    </div>
                );
            case 'dropdown':
                return (
                    <div>
                        <select
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleFieldChange(fieldKey, e.target.value, field)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            } bg-gray-50 disabled:bg-gray-100`}
                            disabled={isDisabled}
                        >
                            <option value="">Pilih opsi</option>
                            {field.options &&
                                field.options.map((option, index) => (
                                    <option key={`${fieldKey}.option.${index}`} value={option}>
                                        {option}
                                    </option>
                                ))}
                        </select>
                        {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
                    </div>
                );
            case 'file':
                return (
                    <div>
                        {submission?.data?.[fieldKey] && (
                            <div className="mb-2">
                                <p>File sebelumnya: <a href={submission.data[fieldKey]} target="_blank" className="text-blue-500 underline">Lihat file</a></p>
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={(e) => handleFileChange(fieldKey, e.target.files[0], field)}
                            accept=".pdf,.jpg,.png"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[fieldKey] ? 'border-red-500' : 'border-gray-200'
                            } bg-gray-50 disabled:bg-gray-100`}
                            disabled={isDisabled}
                        />
                        {imagePreviews[fieldKey] && (
                            <img src={imagePreviews[fieldKey]} alt="Preview" className="mt-2 max-w-xs" />
                        )}
                        {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
                    </div>
                );
            case 'quill':
                return (
                    <div>
                        <ReactQuill
                            value={formData[fieldKey] || ''}
                            onChange={(value) => handleQuillChange(fieldKey, value, field)}
                            className={`border rounded-lg ${errors[fieldKey] ? 'border-red-500' : 'border-gray-200'}`}
                            readOnly={isDisabled}
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
                        {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    // Navigate to next section
    const handleNextSection = () => {
        if (currentSectionIndex < form.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        }
    };

    // Navigate to previous section
    const handlePreviousSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    return (
        <GuestLayout>
            <Head title={form?.form_name || 'Formulir Beasiswa'} />
            <NavbarGuestLayoutPage />

            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* User Info and Logout */}
                    {isAuthenticated && (
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-lg font-semibold">Selamat datang, {auth.user.name}</p>
                                <p className="text-sm text-gray-600">NIM: {auth.user.nim}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    {/* Login Prompt for Guests */}
                    {!isAuthenticated && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
                            <p className="text-yellow-700">
                                Anda harus{' '}
                                <Link href="/login" className="underline font-semibold">
                                    login
                                </Link>{' '}
                                sebagai mahasiswa untuk mengisi formulir ini.
                            </p>
                        </div>
                    )}

                    {/* Scholarship and Form Info */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h1 className="text-2xl font-bold mb-2">{scholarship.name}</h1>
                        <h2 className="text-xl font-semibold mb-4">{form.form_name}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">
                                    <span className="font-medium">Tanggal Mulai:</span>{' '}
                                    {formatDate(form.start_date)}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Tanggal Berakhir:</span>{' '}
                                    {formatDate(form.close_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">
                                    <span className="font-medium">Status Pengisian:</span>{' '}
                                    {form.accept_responses ? 'Menerima Tanggapan' : 'Ditutup'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Edit Diizinkan:</span>{' '}
                                    {form.allow_edit ? 'Ya' : 'Tidak'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Rendering */}
                    {isAuthenticated && isMahasiswa && form.accept_responses && (
                        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                            {/* Section Navigation */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">
                                    {form.sections[currentSectionIndex].title || `Bagian ${currentSectionIndex + 1}`}
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={handlePreviousSection}
                                        disabled={currentSectionIndex === 0}
                                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextSection}
                                        disabled={currentSectionIndex === form.sections.length - 1}
                                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                {form.sections[currentSectionIndex].fields.map((field, fieldIndex) => (
                                    <div key={`field-${field.field_id}`} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {field.field_name}
                                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderField(field, currentSectionIndex, fieldIndex)}
                                    </div>
                                ))}
                            </div>

                            {/* Submit Button */}
                            {currentSectionIndex === form.sections.length - 1 && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading || (hasSubmitted && !form.allow_edit)}
                                        className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${
                                            isLoading || (hasSubmitted && !form.allow_edit)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                    >
                                        {isLoading
                                            ? 'Mengirim...'
                                            : submission && form.allow_edit
                                            ? 'Perbarui Pengajuan'
                                            : 'Kirim Pengajuan'}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {/* Submission Status */}
                    {isAuthenticated && isMahasiswa && hasSubmitted && !form.accept_responses && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-6">
                            <p className="text-yellow-700">
                                Anda telah mengirimkan formulir ini, tetapi pengisian saat ini ditutup.
                            </p>
                        </div>
                    )}

                    {/* Success Notification */}
                    {showSuccess && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
                            Pengajuan berhasil {submission && form.allow_edit ? 'diperbarui' : 'dikirim'}!
                        </div>
                    )}

                    {/* Error Notification */}
                    {showError && (
                        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
                            {errors.api || 'Terjadi kesalahan. Silakan coba lagi.'}
                        </div>
                    )}
                </div>
            </div>

            <FooterLayout />
        </GuestLayout>
    );
}
