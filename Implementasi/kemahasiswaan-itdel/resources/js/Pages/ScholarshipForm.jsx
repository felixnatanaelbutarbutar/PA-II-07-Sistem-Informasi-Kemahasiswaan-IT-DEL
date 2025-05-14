import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';

export default function ScholarshipForm({ auth, form, scholarship, submission, flash: initialFlash, errors: serverErrors }) {
    const { props } = usePage();
    const isAuthenticated = !!auth.user;
    const isMahasiswa = isAuthenticated && auth.user.role?.toLowerCase() === 'mahasiswa';

    const initialFormData = submission?.data || {};
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [flash, setFlash] = useState(initialFlash || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const flashFromProps = props.flash || {};
        setFlash(flashFromProps);

        if (flashFromProps?.success) {
            setShowSuccess(true);
            setErrors({});
            setTimeout(() => setShowSuccess(false), 3000);
        }

        if (flashFromProps?.error || serverErrors?.general || serverErrors?.auth) {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    }, [props.flash, serverErrors]);

    const handleChange = (e, fieldKey) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value,
        }));
        setErrors((prev) => ({
            ...prev,
            [fieldKey]: '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isMahasiswa) {
            console.error('Submission blocked: Not mahasiswa', { isMahasiswa, authUser: auth.user });
            setErrors({ general: 'Anda harus login sebagai mahasiswa untuk mengirim formulir.' });
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        setIsSubmitting(true);
        const submissionData = new FormData();
        submissionData.append('form_id', form.form_id);
        submissionData.append('scholarship_id', scholarship.scholarship_id);

        Object.entries(formData).forEach(([key, value]) => {
            if (value instanceof File) {
                submissionData.append(`data[${key}]`, value);
            } else {
                submissionData.append(`data[${key}]`, value || '');
            }
        });

        router.post(route('forms.submit'), submissionData, {
            onBefore: () => {
                setErrors({});
                setShowError(false);
            },
            onSuccess: (page) => {
                setFlash({ success: page.props.flash?.success || 'Pengajuan berhasil dikirim.' });
                setShowSuccess(true);
                setErrors({});
                setFormData({});
                setTimeout(() => {
                    setShowSuccess(false);
                    router.visit(`/scholarships/${scholarship.scholarship_id}`);
                }, 2000);
            },
            onError: (newErrors) => {
                console.error('Submission error:', newErrors);
                setErrors(newErrors);
                setFlash({ error: newErrors.general || 'Gagal mengirim formulir. Silakan coba lagi.' });
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
            },
            onFinish: () => setIsSubmitting(false),
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    const handleLogout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                router.get(route('scholarships.index'));
            },
        });
    };

    const renderField = (field, section) => {
        // Gunakan section.title dan field.order untuk membentuk key
        const fieldKey = `sections.${section.title}.fields.${field.order}`;
        const error = errors[fieldKey];

        switch (field.field_type) {
            case 'text':
            case 'number':
            case 'date':
                return (
                    <div className="form-group">
                        <label htmlFor={fieldKey}>
                            {field.field_name} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type={field.field_type}
                            id={fieldKey}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e, fieldKey)}
                            required={field.is_required}
                            className="w-full"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                );
            case 'quill':
                return (
                    <div className="form-group">
                        <label htmlFor={fieldKey}>
                            {field.field_name} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            id={fieldKey}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e, fieldKey)}
                            required={field.is_required}
                            className="w-full"
                            rows="6"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                );
            case 'dropdown':
                return (
                    <div className="form-group">
                        <label htmlFor={fieldKey}>
                            {field.field_name} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            id={fieldKey}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e, fieldKey)}
                            required={field.is_required}
                            className="w-full"
                        >
                            <option value="">Pilih opsi</option>
                            {field.options?.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {error && <span className="error">{error}</span>}
                    </div>
                );
            case 'file':
                return (
                    <div className="form-group">
                        <label htmlFor={fieldKey}>
                            {field.field_name} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="file"
                            id={fieldKey}
                            name={fieldKey}
                            onChange={(e) => handleChange(e, fieldKey)}
                            required={field.is_required && !formData[fieldKey]}
                            accept=".pdf,.jpeg,.png"
                            className="w-full"
                        />
                        {formData[fieldKey] instanceof File && (
                            <p className="text-sm text-gray-600">File: {formData[fieldKey].name}</p>
                        )}
                        {error && <span className="error">{error}</span>}
                    </div>
                );
            default:
                return null;
        }
    };

    const currentUrl = window.location.pathname + window.location.search;

    return (
        <GuestLayout>
            <Navbar />
            <Head title={form.form_name || 'Formulir Beasiswa'} />

            <style>{`
                body { margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background: #f0f9ff; color: #1e293b; }
                .main-container { min-height: 100vh; padding: 40px 20px 80px; display: flex; flex-direction: column; align-items: center; background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%); width: 100%; }
                .content-section { max-width: 1400px; width: 100%; background: #ffffff; border-radius: 20px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); padding: 40px; margin-bottom: 40px; transition: all 0.3s ease; animation: fadeIn 0.5s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .form-section h2 { font-size: 28px; font-weight: 700; color: #0369a1; text-align: center; margin-bottom: 20px; position: relative; display: block; width: 100%; }
                .form-section h2:after { content: ''; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 80px; height: 4px; background: linear-gradient(90deg, #0ea5e9, #0284c7); border-radius: 2px; }
                .form-section .subheader { text-align: center; color: #64748b; font-size: 16px; margin-bottom: 30px; }
                .auth-message { text-align: center; background: #f0f9ff; padding: 20px; border-radius: 14px; margin-bottom: 30px; }
                .auth-message p { font-size: 16px; color: #475569; margin-bottom: 10px; }
                .auth-message .auth-name { font-weight: 600; color: #0284c7; }
                .auth-message .button-group { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
                .login-link, .logout-button { display: inline-flex; align-items: center; padding: 12px 24px; background: #0ea5e9; color: #ffffff; border-radius: 10px; text-decoration: none; font-size: 16px; font-weight: 600; transition: all 0.3s ease; border: none; cursor: pointer; }
                .logout-button { background: #ef4444; }
                .login-link:hover, .logout-button:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(14, 165, 233, 0.2); }
                .logout-button:hover { box-shadow: 0 6px 15px rgba(239, 68, 68, 0.2); }
                .login-link img, .logout-button img { margin-right: 8px; width: 20px; height: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr; gap: 25px; width: 100%; max-width: 800px; margin: 0 auto; }
                .form-group { width: 100%; }
                .form-group label { font-weight: 600; color: #334155; display: block; margin-bottom: 10px; font-size: 16px; }
                .form-group input, .form-group select, .form-group textarea { border: 2px solid #e2e8f0; border-radius: 12px; padding: 14px; width: 100%; box-sizing: border-box; font-size: 16px; color: #334155; transition: all 0.3s ease; background: #f8fafc; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15); outline: none; background: #ffffff; }
                .form-group textarea { resize: vertical; min-height: 150px; }
                .form-group .error { color: #ef4444; font-size: 14px; margin-top: 6px; display: block; }
                .submit-button { background: linear-gradient(to right, #0ea5e9, #0284c7); color: #ffffff; padding: 14px 28px; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; min-width: 220px; transition: all 0.3s ease; margin: 30px auto 0; }
                .submit-button:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3); }
                .submit-button:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; box-shadow: none; }
                .success-toast { position: fixed; top: 20px; right: 20px; background: #16a34a; color: #ffffff; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: flex; align-items: center; gap: 12px; animation: toastFadeInOut 3s ease-in-out; z-index: 1000; font-size: 16px; font-weight: 500; }
                .error-toast { position: fixed; top: 20px; right: 20px; background: #ef4444; color: #ffffff; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: flex; align-items: center; gap: 12px; animation: toastFadeInOut 3s ease-in-out; z-index: 1000; font-size: 16px; font-weight: 500; }
                @keyframes toastFadeInOut { 0% { opacity: 0; transform: translateX(20px); } 10% { opacity: 1; transform: translateX(0); } 90% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }
                @media (max-width: 768px) { .main-container { padding: 30px 15px; } .content-section { padding: 20px; } .form-section h2 { font-size: 24px; } .form-grid { gap: 15px; } .form-group label { font-size: 14px; } .form-group input, .form-group select, .form-group textarea { padding: 12px; font-size: 14px; } .submit-button { min-width: 100%; padding: 12px 20px; font-size: 14px; } }
            `}</style>

            <div className="main-container">
                <div className="content-section form-section">
                    <h2>Formulir Pengajuan Beasiswa</h2>
                    <p className="subheader">
                        Silakan isi formulir berikut dengan lengkap dan benar. Pastikan semua dokumen yang diperlukan telah diunggah.
                    </p>
                    <div className="auth-message">
                        {isAuthenticated ? (
                            <div>
                                <p>
                                    Anda login sebagai: <span className="auth-name">{auth.user.name}</span> (NIM: {auth.user.nim})
                                </p>
                                <div className="button-group">
                                    <button onClick={handleLogout} className="logout-button">
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/ffffff/logout-rounded-left.png"
                                            width="20"
                                            height="20"
                                            alt="Logout Icon"
                                        />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    Untuk menampilkan dan mengisi formulir ini anda harus terlebih dahulu login.
                                </p>
                                <div className="button-group">
                                    <Link
                                        href={`${route('login')}?intended=${encodeURIComponent(currentUrl)}`}
                                        className="login-link"
                                    >
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/ffffff/login-rounded-right.png"
                                            width="20"
                                            height="20"
                                            alt="Login Icon"
                                        />
                                        Login Sekarang
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    {isAuthenticated && form.accept_responses && (
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="form-grid">
                                {form.sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="section">
                                        {section.title && (
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{section.title}</h3>
                                        )}
                                        {section.fields.map((field, fieldIndex) => (
                                            <div key={field.field_id}>
                                                {renderField(field, section)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={!isMahasiswa || !form.accept_responses || isSubmitting}
                                className="submit-button"
                            >
                                <img
                                    src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                                    width="20"
                                    height="20"
                                    alt="Checkmark Icon"
                                />
                                {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </button>
                        </form>
                    )}
                    {isAuthenticated && !form.accept_responses && (
                        <p className="text-center text-red-600">
                            Formulir ini saat ini tidak menerima pengajuan. Silakan periksa periode pendaftaran.
                        </p>
                    )}
                </div>
            </div>

            {showSuccess && flash?.success && (
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

            {showError && (flash?.error || errors.general) && (
                <div className="error-toast">
                    <img
                        src="https://img.icons8.com/ios-filled/50/ffffff/error.png"
                        width="20"
                        height="20"
                        alt="Error Icon"
                    />
                    {flash?.error || errors.general || 'Gagal mengirim pengajuan. Silakan coba lagi.'}
                </div>
            )}

            <FooterLayout />
        </GuestLayout>
    );
}