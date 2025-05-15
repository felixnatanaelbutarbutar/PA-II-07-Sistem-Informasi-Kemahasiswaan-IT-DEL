import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';

export default function Aspiration({ categories, mpm }) {
    // Initialize form data, checking for query parameters
    const { props } = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const initialStory = urlParams.get('story') || '';
    const initialCategoryId = urlParams.get('category_id') || '';

    const [formData, setFormData] = useState({
        story: initialStory,
        category_id: initialCategoryId,
        image: null,
    });
    const [errors, setErrors] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    // Handle flash messages for notifications
    useEffect(() => {
        if (props.flash) {
            if (props.flash.success) {
                setNotificationMessage(props.flash.success);
                setNotificationType('success');
                setShowNotification(true);
            } else if (props.flash.error) {
                setNotificationMessage(props.flash.error);
                setNotificationType('error');
                setShowNotification(true);
            }

            if (props.flash.success || props.flash.error) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [props.flash]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Submit the form
        const data = new FormData();
        data.append('story', formData.story);
        data.append('category_id', formData.category_id);
        if (formData.image) data.append('image', formData.image);

        router.post(route('aspiration.store'), data, {
            onError: (errors) => {
                setErrors(errors);
            },
            onSuccess: () => {
                // Reset form after successful submission
                setFormData({ story: '', category_id: '', image: null });
                setNotificationMessage('Aspirasi berhasil dikirim!');
                setNotificationType('success');
                setShowNotification(true);
            },
        });
    };

    // Clear query params from URL after loading form data
    useEffect(() => {
        if (initialStory || initialCategoryId) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [initialStory, initialCategoryId]);

    // Informasi penting menyuarakan aspirasi
    const importanceInfo = [
        {
            title: "Memperkuat Suara Kolektif",
            description: "Aspirasi Anda membantu membentuk kebijakan yang mencerminkan kebutuhan bersama."
        },
        {
            title: "Mendorong Perubahan Positif",
            description: "Setiap suara dapat menjadi pemicu perbaikan lingkungan akademik dan sosial."
        },
        {
            title: "Meningkatkan Transparansi",
            description: "Menyebarkan aspirasi secara anonim memastikan proses yang terbuka dan adil."
        },
    ];

    return (
        <GuestLayout>
            <Navbar />
            <Head title="Formulir Aspirasi" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notificationType === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notificationType === 'success' ? (
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
                                    notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notificationMessage}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notificationType === 'success'
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

            {/* CSS Styles */}
            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Poppins', sans-serif;
                        background: #f5f7fa;
                    }
                    .main-container {
                        background: linear-gradient(135deg, #e6f0fa 0%, #f5f7fa 100%);
                        min-height: 100vh;
                        padding: 40px 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .grid-container {
                        max-width: 1200px;
                        width: 100%;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                        margin: 0 auto;
                    }
                    .form-section, .content-section {
                        background: #ffffff;
                        border-radius: 20px;
                        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
                        padding: 40px;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .form-section::before, .content-section::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 5px;
                        background: linear-gradient(90deg, #3498db, #2980b9);
                    }
                    .form-section:hover, .content-section:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 25px;
                        gap: 10px;
                    }
                    .header h2 {
                        font-size: 30px;
                        font-weight: 700;
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .header svg {
                        width: 30px;
                        height: 30px;
                        color: #3498db;
                    }
                    .subheader {
                        text-align: center;
                        color: #666666;
                        font-size: 16px;
                        margin-bottom: 25px;
                        font-style: italic;
                    }
                    .form-table {
                        width: 100%;
                    }
                    .form-table td {
                        padding: 8px;
                    }
                    .form-table label {
                        font-weight: 600;
                        color: #2c3e50;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    .form-table label svg {
                        width: 18px;
                        height: 18px;
                        color: #3498db;
                    }
                    .form-table textarea,
                    .form-table select,
                    .form-table input[type="file"],
                    .form-table .submit-button {
                        border: 2px solid #3498db;
                        border-radius: 10px;
                        padding: 12px;
                        width: 100%;
                        box-sizing: border-box;
                        font-size: 14px;
                        color: #333333;
                        background: #f9fbfd;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
                    }
                    .form-table textarea:hover,
                    .form-table select:hover,
                    .form-table input[type="file"]:hover {
                        background: #ffffff;
                        box-shadow: 0 0 10px rgba(52, 152, 219, 0.1);
                    }
                    .form-table textarea:focus,
                    .form-table select:focus,
                    .form-table input[type="file"]:focus {
                        border-color: #2980b9;
                        box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.15);
                        outline: none;
                        background: #ffffff;
                    }
                    .form-table textarea {
                        resize: vertical;
                        min-height: 120px;
                    }
                    .form-table .disabled {
                        background: #e0e0e0;
                        border-color: #cccccc;
                        color: #888888;
                        cursor: not-allowed;
                        pointer-events: none;
                    }
                    .form-table .disabled:hover {
                        background: #e0e0e0;
                        box-shadow: none;
                    }
                    .form-table .error {
                        color: #e74c3c;
                        font-size: 12px;
                        margin-top: 5px;
                        animation: pulse 1s infinite;
                    }
                    .form-table .submit-button {
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        color: #ffffff;
                        padding: 12px 25px;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
                        transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
                        width: 100%;
                        margin-top: 10px;
                    }
                    .form-table .submit-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                        background: linear-gradient(90deg, #2980b9, #3498db);
                    }
                    .form-table .submit-button:disabled {
                        background: #cccccc;
                        cursor: not-allowed;
                        transform: none;
                        box-shadow: none;
                    }
                    .content-section h3 {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 26px;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 25px;
                        gap: 10px;
                    }
                    .content-section h3 svg {
                        width: 26px;
                        height: 26px;
                        color: #3498db;
                    }
                    .content-section p {
                        text-align: justify;
                        color: #666666;
                        font-size: 16px;
                        margin-bottom: 20px;
                        line-height: 1.6;
                    }
                    .content-section ul {
                        list-style-type: none;
                        padding-left: 0;
                        color: #666666;
                        font-size: 16px;
                        margin-bottom: 25px;
                    }
                    .content-section ul li {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .content-section ul li svg {
                        width: 20px;
                        height: 20px;
                        color: #3498db;
                    }
                    .content-section .quote {
                        text-align: center;
                        font-size: 18px;
                        font-weight: 600;
                        color: #3498db;
                        background: #e6f0fa;
                        padding: 15px;
                        border-radius: 10px;
                        border-left: 4px solid #2980b9;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    @keyframes slide-in-right {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes fade-in {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .fade-in {
                        animation: fade-in 0.6s ease-out forwards;
                    }
                    @media (max-width: 768px) {
                        .grid-container {
                            grid-template-columns: 1fr;
                            gap: 30px;
                        }
                        .form-section, .content-section {
                            padding: 25px;
                        }
                        .header h2 {
                            font-size: 24px;
                        }
                        .header svg {
                            width: 24px;
                            height: 24px;
                        }
                        .content-section h3 {
                            font-size: 22px;
                        }
                        .content-section h3 svg {
                            width: 22px;
                            height: 22px;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                <div className="grid-container">
                    {/* Left Side: Form Section */}
                    <div className="form-section fade-in">
                        <div className="header">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                            </svg>
                            <h2>Formulir Aspirasi</h2>
                        </div>
                        <div className="subheader">
                            {mpm?.aspiration_status === 'OPEN'
                                ? 'Sampaikan aspirasi Anda secara anonim untuk perubahan yang lebih baik.'
                                : 'Pendataan aspirasi saat ini ditutup. Baca informasi di bawah untuk mengapa menyuarakan aspirasi itu penting.'}
                        </div>
                        {mpm?.aspiration_status === 'OPEN' ? (
                            <form onSubmit={handleSubmit}>
                                <table className="form-table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <label>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 7h18M3 11h18m-6 4h6m-6 4h6"
                                                        />
                                                    </svg>
                                                    Kategori
                                                </label>
                                            </td>
                                            <td>
                                                <select
                                                    name="category_id"
                                                    value={formData.category_id}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.category_id && <div className="error">{errors.category_id}</div>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12H9m6-3H9m6 6H9m-6 6h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    Cerita Aspirasi
                                                </label>
                                            </td>
                                            <td>
                                                <textarea
                                                    name="story"
                                                    value={formData.story}
                                                    onChange={handleChange}
                                                    placeholder="Ceritakan aspirasi Anda di sini..."
                                                    rows="5"
                                                ></textarea>
                                                {errors.story && <div className="error">{errors.story}</div>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4-4m0 0l4 4m-4-4v8m8-12H8a4 4 0 00-4 4v8h16v-8a4 4 0 00-4-4z"
                                                        />
                                                    </svg>
                                                    Gambar (Opsional)
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="file"
                                                    name="image"
                                                    onChange={handleChange}
                                                    accept="image/*"
                                                />
                                                {errors.image && <div className="error">{errors.image}</div>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <button type="submit" className="submit-button">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        className="w-5 h-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    Kirim Aspirasi
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        ) : (
                            <div className="content-section fade-in">
                                <h3>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Kenapa Penting Menyuarakan Aspirasi?
                                </h3>
                                <p>
                                    Meskipun pendataan aspirasi saat ini ditutup, menyuarakan aspirasi tetap menjadi langkah penting untuk membangun komunitas yang lebih baik. Berikut alasannya:
                                </p>
                                <ul>
                                    {importanceInfo.map((item, index) => (
                                        <li key={index}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <strong>{item.title}</strong>: {item.description}
                                        </li>
                                    ))}
                                </ul>
                                <div className="quote">
                                    "Suara Anda adalah kekuatan untuk perubahan, tunggu pembukaan berikutnya!"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Content Section */}
                    <div className="content-section fade-in">
                        <h3>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            Petunjuk Pengisian
                        </h3>
                        <p>
                            Aspirasi Anda akan diterima secara anonim. Pastikan untuk memilih kategori yang sesuai dan jelaskan cerita Anda dengan detail. Anda juga dapat melampirkan gambar sebagai pendukung jika diperlukan.
                        </p>
                        <ul>
                            <li>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Pilih kategori yang paling relevan dengan aspirasi Anda.
                            </li>
                            <li>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Tulis cerita dengan jelas dan singkat (maksimal 1000 karakter).
                            </li>
                            <li>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Gambar yang diunggah harus berformat JPG, PNG, atau JPEG, maksimal 2MB.
                            </li>
                        </ul>
                        <div className="quote">
                            "Aspirasi Anda adalah langkah awal untuk perubahan yang lebih baik!"
                        </div>
                    </div>
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}