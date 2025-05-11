import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState } from 'react';

export default function ScholarshipForm({ form, scholarship }) {
    const [formData, setFormData] = useState({});

    // Format tanggal ke dalam format DD MMMM YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'Tidak Diketahui';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Handle form input change
    const handleInputChange = (fieldId, value) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        submissionData.append('form_id', form.form_id);

        // Tambahkan data formulir ke FormData
        Object.keys(formData).forEach((fieldId) => {
            const value = formData[fieldId];
            if (value instanceof File) {
                submissionData.append(`data[${fieldId}]`, value);
            } else {
                submissionData.append(`data[${fieldId}]`, value || '');
            }
        });

        router.post('/submit-form', submissionData, {
            onSuccess: () => {
                alert('Pendaftaran berhasil dikirim!');
                router.visit(`/beasiswa/${scholarship.scholarship_id}`);
            },
            onError: (errors) => {
                alert(errors.error || 'Terjadi kesalahan saat mengirimkan formulir.');
            },
        });
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title={`Formulir Pendaftaran - ${form.form_name}`} />

            {/* CSS Styles */}
            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Inter', Arial, sans-serif;
                        background: #f8fafc;
                    }
                    .main-container {
                        min-height: 100vh;
                        padding: 60px 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .header-section {
                        width: 100%;
                        height: 400px;
                        background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80') no-repeat center center;
                        background-size: cover;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #ffffff;
                        text-align: center;
                        position: relative;
                        margin-bottom: 40px;
                    }
                    .header-section::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                    }
                    .header-section h1 {
                        font-size: 48px;
                        font-weight: 700;
                        position: relative;
                        z-index: 1;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    .header-section p {
                        font-size: 18px;
                        position: relative;
                        z-index: 1;
                        margin-top: 10px;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    }
                    .header-section p a, .header-section p span {
                        color: #ffffff;
                        font-weight: 500;
                    }
                    .form-section {
                        max-width: 1200px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        padding: 40px;
                        margin-bottom: 40px;
                    }
                    .form-section h3 {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1e40af;
                        margin-bottom: 20px;
                    }
                    .form-section .section-title {
                        font-size: 20px;
                        font-weight: 500;
                        color: #1f2937;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #e5e7eb;
                        padding-bottom: 5px;
                    }
                    .form-field {
                        margin-bottom: 20px;
                    }
                    .form-field label {
                        display: block;
                        font-size: 16px;
                        color: #1f2937;
                        margin-bottom: 5px;
                    }
                    .form-field label span {
                        color: #e11d48;
                    }
                    .form-field input,
                    .form-field select,
                    .form-field textarea {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 16px;
                        color: #1f2937;
                    }
                    .form-field textarea {
                        min-height: 120px;
                        resize: vertical;
                    }
                    .form-field input[type="file"] {
                        padding: 5px;
                    }
                    .submit-button {
                        display: block;
                        margin: 20px auto 0;
                        padding: 12px 24px;
                        background: #1e40af;
                        color: #ffffff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    .submit-button:hover {
                        background: #1e3a8a;
                    }
                    .back-button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 24px;
                        background: #1e40af;
                        color: #ffffff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        text-decoration: none;
                        transition: background 0.3s ease;
                    }
                    .back-button:hover {
                        background: #1e3a8a;
                    }
                    .timeline {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .timeline p {
                        font-size: 16px;
                        color: #4b5563;
                        margin: 5px 0;
                    }
                    .timeline p strong {
                        color: #1e40af;
                    }
                    @media (max-width: 768px) {
                        .main-container {
                            padding: 40px 15px;
                        }
                        .header-section {
                            height: 300px;
                        }
                        .header-section h1 {
                            font-size: 32px;
                        }
                        .header-section p {
                            font-size: 16px;
                        }
                        .form-section {
                            padding: 30px;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                {/* Header Section */}
                <div className="header-section">
                    <h1>Formulir Pendaftaran - {scholarship.name}</h1>
                    <p className="flex flex-wrap justify-center gap-1">
                        <Link href="/" className="hover:underline">Beranda</Link>
                        <span className="mx-2">/</span>
                        <span>Layanan Kemahasiswaan</span>
                        <span className="mx-2">/</span>
                        <Link href="/beasiswa" className="hover:underline">Beasiswa</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/beasiswa/${scholarship.scholarship_id}`} className="hover:underline">{scholarship.name}</Link>
                        <span className="mx-2">/</span>
                        <span>Formulir Pendaftaran</span>
                    </p>
                </div>

                {/* Form Section */}
                <div className="form-section">
                    <h3>Formulir Pendaftaran {form.form_name}</h3>
                    {form && (
                        <div className="timeline">
                            <p>
                                <strong>Tanggal Buka:</strong> {formatDate(form.open_date)}
                            </p>
                            <p>
                                <strong>Tanggal Tutup:</strong> {form.close_date ? formatDate(form.close_date) : 'Belum Ditentukan'}
                            </p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {form.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                {section.title && (
                                    <div className="section-title">{section.title}</div>
                                )}
                                {section.fields.map((field) => (
                                    <div key={field.field_id} className="form-field">
                                        <label>
                                            {field.field_name}
                                            {field.is_required && <span> *</span>}
                                        </label>
                                        {field.field_type === 'text' && (
                                            <input
                                                type="text"
                                                value={formData[field.field_id] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(field.field_id, e.target.value)
                                                }
                                                required={field.is_required}
                                            />
                                        )}
                                        {field.field_type === 'number' && (
                                            <input
                                                type="number"
                                                value={formData[field.field_id] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(field.field_id, e.target.value)
                                                }
                                                required={field.is_required}
                                            />
                                        )}
                                        {field.field_type === 'date' && (
                                            <input
                                                type="date"
                                                value={formData[field.field_id] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(field.field_id, e.target.value)
                                                }
                                                required={field.is_required}
                                            />
                                        )}
                                        {field.field_type === 'dropdown' && field.options && (
                                            <select
                                                value={formData[field.field_id] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(field.field_id, e.target.value)
                                                }
                                                required={field.is_required}
                                            >
                                                <option value="">Pilih opsi</option>
                                                {field.options.map((option, index) => (
                                                    <option key={index} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {field.field_type === 'file' && (
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    handleInputChange(field.field_id, e.target.files[0])
                                                }
                                                required={field.is_required}
                                            />
                                        )}
                                        {field.field_type === 'quill' && (
                                            <textarea
                                                value={formData[field.field_id] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(field.field_id, e.target.value)
                                                }
                                                required={field.is_required}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button type="submit" className="submit-button">
                            Kirim Pendaftaran
                        </button>
                    </form>
                </div>

                <Link href={`/beasiswa/${scholarship.scholarship_id}`} className="back-button">
                    Kembali ke Detail Beasiswa
                </Link>
            </div>

            <FooterLayout />
        </GuestLayout>
    );
}
