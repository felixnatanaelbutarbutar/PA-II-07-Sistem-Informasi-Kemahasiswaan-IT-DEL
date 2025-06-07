import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';

export default function ScholarshipForm({ auth, form, scholarship, submission, flash: initialFlash, errors: serverErrors }) {
    const { props } = usePage();
    const isAuthenticated = !!auth.user;
    // Update role check to include adminmpm and adminbem
    const canSubmitForm = isAuthenticated && ['mahasiswa', 'adminmpm', 'adminbem'].includes(auth.user.role?.toLowerCase());

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
        if (!canSubmitForm) {
            console.error('Submission blocked: Unauthorized role', { canSubmitForm, authUser: auth.user });
            setErrors({ general: 'Anda harus login sebagai mahasiswa, admin MPM, atau admin BEM untuk mengirim formulir.' });
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
        const fieldKey = `sections.${section.title}.fields.${field.order}`;
        const error = errors[fieldKey];

        switch (field.field_type) {
            case 'text':
            case 'number':
            case 'date':
                return (
                    <div className="form-group">
                        <label htmlFor={fieldKey}>
                            {field.field_name || '-'} {field.is_required && <span className="text-red-500">*</span>}
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
                            {field.field_name || '-'} {field.is_required && <span className="text-red-500">*</span>}
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
                            {field.field_name || '-'} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            id={fieldKey}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleChange(e, fieldKey)}
                            required={field.is_required}
                            className="w-full"
                        >
                            <option value="">Pilih salah satu</option>
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
                            {field.field_name || '-'} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="file"
                            id={fieldKey}
                            name={fieldKey}
                            onChange={(e) => handleChange(e, fieldKey)}
                            required={field.is_required && !formData[fieldKey]}
                            accept=".pdf,.jpg,.jpeg,.png"
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
            <Navbar showBreadcrumbAndHeader={false}/>
            <Head title={form.form_name || 'Formulir Beasiswa'} />

            <style>{`
                body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background: #f9fafb; color: #1e293b; }
                .main-container { min-height: calc(100vh - 200px); padding: ${window.innerWidth <= 768 ? '16px' : '32px'}; display: flex; flex-direction: column; align-items: center; width: 100%; }
                .content-section { max-width: 1500px; width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); padding: ${window.innerWidth <= 768 ? '20px' : '32px'}; margin-bottom: ${window.innerWidth <= 768 ? '16px' : '32px'}; transition: all 0.3s ease; }
                .form-section h2 { font-size: ${window.innerWidth <= 768 ? '24px' : '36px'}; font-weight: 800; color: #1e40af; margin-bottom: ${window.innerWidth <= 768 ? '16px' : '24px'}; text-align: center; text-transform: uppercase; position: relative; }
                .form-section h2:after { content: ''; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 80px; height: 4px; background: linear-gradient(90deg, #1e40af, #3b82f6); border-radius: 2px; }
                .form-section .subheader { text-align: center; color: #6b7280; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; margin-bottom: ${window.innerWidth <= 768 ? '20px' : '30px'}; }
                .auth-message { text-align: center; background: #f9fafb; padding: ${window.innerWidth <= 768 ? '15px' : '20px'}; border-radius: 8px; margin-bottom: ${window.innerWidth <= 768 ? '20px' : '30px'}; }
                .auth-message p { font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; color: #6b7280; margin-bottom: ${window.innerWidth <= 768 ? '10px' : '15px'}; }
                .auth-message .auth-name { font-weight: 600; color: #1e40af; }
                .auth-message .role-text { font-weight: 600; color: #1e40af; text-transform: capitalize; }
                .auth-message .button-group { display: flex; justify-content: center; gap: ${window.innerWidth <= 768 ? '10px' : '15px'}; margin-top: ${window.innerWidth <= 768 ? '10px' : '15px'}; }
                .login-link, .logout-button { display: inline-flex; align-items: center; padding: ${window.innerWidth <= 768 ? '10px 20px' : '12px 24px'}; background: #1e40af; color: #ffffff; border-radius: 8px; text-decoration: none; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; font-weight: 600; transition: all 0.3s ease; border: none; cursor: pointer; }
                .logout-button { background: #ef4444; }
                .login-link:hover, .logout-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2); }
                .logout-button:hover { box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
                .login-link img, .logout-button img { margin-right: 8px; width: ${window.innerWidth <= 768 ? '16px' : '20px'}; height: ${window.innerWidth <= 768 ? '16px' : '20px'}px; }
                .form-grid { display: grid; grid-template-columns: 1fr; gap: ${window.innerWidth <= 768 ? '16px' : '25px'}; width: 100%; max-width: 800px; margin: 0 auto; }
                .form-group { width: 100%; }
                .form-group label { font-weight: 600; color: #1f2937; display: block; margin-bottom: ${window.innerWidth <= 768 ? '8px' : '10px'}; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; }
                .form-group input, .form-group select, .form-group textarea { border: 2px solid #e5e7eb; border-radius: 8px; padding: ${window.innerWidth <= 768 ? '12px' : '14px'}; width: 100%; box-sizing: border-box; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; color: #1f2937; transition: all 0.3s ease; background: #ffffff; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15); outline: none; }
                .form-group textarea { resize: vertical; min-height: ${window.innerWidth <= 768 ? '120px' : '150px'}; }
                .form-group .error { color: #dc2626; font-size: ${window.innerWidth <= 768 ? '12px' : '14px'}; margin-top: ${window.innerWidth <= 768 ? '4px' : '6px'}; display: block; }
                .submit-button { background: #1e40af; color: #ffffff; padding: ${window.innerWidth <= 768 ? '12px 20px' : '14px 28px'}; border: none; border-radius: 8px; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: ${window.innerWidth <= 768 ? '8px' : '10px'}; min-width: ${window.innerWidth <= 768 ? '100%' : '220px'}; transition: all 0.3s ease; margin: ${window.innerWidth <= 768 ? '20px' : '30px'} auto 0; }
                .submit-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2); }
                .submit-button:disabled { background: #d1d5db; cursor: not-allowed; transform: none; box-shadow: none; }
                .success-toast { position: fixed; top: 20px; right: 20px; background: #16a34a; color: #ffffff; padding: ${window.innerWidth <= 768 ? '12px 18px' : '16px 24px'}; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); display: flex; align-items: center; gap: ${window.innerWidth <= 768 ? '8px' : '12px'}; animation: toastFadeInOut 3s ease-in-out; z-index: 1000; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; font-weight: 500; }
                .error-toast { position: fixed; top: 20px; right: 20px; background: #ef4444; color: #ffffff; padding: ${window.innerWidth <= 768 ? '12px 18px' : '16px 24px'}; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); display: flex; align-items: center; gap: ${window.innerWidth <= 768 ? '8px' : '12px'}; animation: toastFadeInOut 3s ease-in-out; z-index: 1000; font-size: ${window.innerWidth <= 768 ? '14px' : '16px'}; font-weight: 500; }
                @keyframes toastFadeInOut { 0% { opacity: 0; transform: translateX(20px); } 10% { opacity: 1; transform: translateX(0); } 90% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }
                @media (max-width: 768px) { .main-container { padding: 16px; } .content-section { padding: 20px; } .form-section h2 { font-size: 24px; margin-bottom: 16px; } .form-section h2:after { width: 60px; } .form-section .subheader { font-size: 14px; margin-bottom: 20px; } .auth-message { padding: 15px; margin-bottom: 20px; } .auth-message p { font-size: 14px; margin-bottom: 10px; } .auth-message .button-group { gap: 10px; margin-top: 10px; } .login-link, .logout-button { padding: 10px 20px; font-size: 14px; } .login-link img, .logout-button img { width: 16px; height: 16px; } .form-grid { gap: 16px; } .form-group label { font-size: 14px; margin-bottom: 8px; } .form-group input, .form-group select, .form-group textarea { padding: 12px; font-size: 14px; } .form-group textarea { min-height: 120px; } .form-group .error { font-size: 12px; margin-top: 4px; } .submit-button { min-width: 100%; padding: 12px 20px; font-size: 14px; margin: 20px auto 0; } .success-toast, .error-toast { padding: 12px 18px; font-size: 14px; gap: 8px; } }
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
                                    Anda login sebagai: <span className="auth-name">{auth.user.nim || '-'} | {auth.user.name} </span> <br />
                                    {/* Role: <span className="role-text">{auth.user.role || '-'}</span> */}
                                </p>
                                <div className="button-group">
                                    <button onClick={handleLogout} className="logout-button">
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/ffffff/logout-rounded-left.png"
                                            width={window.innerWidth <= 768 ? '16px' : '20px'}
                                            height={window.innerWidth <= 768 ? '16px' : '20px'}
                                            alt="Logout Icon"
                                        />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    Untuk menampilkan dan mengisi formulir ini, Anda harus login sebagai mahasiswa, admin MPM, atau admin BEM.
                                </p>
                                <div className="button-group">
                                    <Link
                                        href={`${route('login')}?intended=${encodeURIComponent(currentUrl)}`}
                                        className="login-link"
                                    >
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/ffffff/login-rounded-right.png"
                                            width={window.innerWidth <= 768 ? '16px' : '20px'}
                                            height={window.innerWidth <= 768 ? '16px' : '20px'}
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
                                disabled={!canSubmitForm || !form.accept_responses || isSubmitting}
                                className="submit-button"
                            >
                                <img
                                    src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                                    width={window.innerWidth <= 768 ? '16px' : '20px'}
                                    height={window.innerWidth <= 768 ? '16px' : '20px'}
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
                        width={window.innerWidth <= 768 ? '16px' : '20px'}
                        height={window.innerWidth <= 768 ? '16px' : '20px'}
                        alt="Success Icon"
                    />
                    {flash.success}
                </div>
            )}

            {showError && (flash?.error || errors.general) && (
                <div className="error-toast">
                    <img
                        src="https://img.icons8.com/ios-filled/50/ffffff/error.png"
                        width={window.innerWidth <= 768 ? '16px' : '20px'}
                        height={window.innerWidth <= 768 ? '16px' : '20px'}
                        alt="Error Icon"
                    />
                    {flash?.error || errors.general || 'Gagal mengirim pengajuan. Silakan coba lagi.'}
                </div>
            )}

            <FooterLayout />
        </GuestLayout>
    );
}