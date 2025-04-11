import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';

export default function Counseling({ auth }) {
    const { props } = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const initialIssue = urlParams.get('issue') || '';
    const initialNoTelephone = urlParams.get('noTelephone') || '';

    const [formData, setFormData] = useState({
        issue: initialIssue,
        noTelephone: initialNoTelephone,
    });
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!auth.isMahasiswa) {
            const queryParams = new URLSearchParams({
                issue: formData.issue,
                noTelephone: formData.noTelephone,
            }).toString();
            router.get(`${route('login')}?${queryParams}`);
            return;
        }

        router.post(route('counseling.store'), formData, {
            onError: (errors) => {
                setErrors(errors);
            },
            onSuccess: () => {
                setFormData({ issue: '', noTelephone: '' });
                setShowSuccess(true);
                setIsFormSubmitted(true); // Enable WhatsApp button
                setTimeout(() => setShowSuccess(false), 3000);
            },
        });
    };

    const handleLogout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                router.get(route('login'));
            },
        });
    };

    useEffect(() => {
        if (initialIssue || initialNoTelephone) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [initialIssue, initialNoTelephone]);

    // WhatsApp contact function
    const handleWhatsAppContact = (e) => {
        e.preventDefault();
        if (!isFormSubmitted) return; // Prevent action if not submitted
        const phoneNumber = '+6285142232595'; // Hardcoded WhatsApp number for counseling service
        const message = `Halo, saya ${auth.user?.name || 'pengguna'} telah mengisi formulir konseling. Bisakah Anda membantu saya untuk langkah selanjutnya?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title="Formulir Konseling" />

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
                    .info-section, .form-section {
                        max-width: 1000px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        padding: 40px;
                        margin-bottom: 40px;
                    }
                    .info-section {
                        text-align: center;
                    }
                    .info-section h2 {
                        font-size: 32px;
                        font-weight: 700;
                        color: #1e40af;
                        margin-bottom: 20px;
                    }
                    .info-section h3 {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1e40af;
                        margin: 20px 0;
                    }
                    .info-section p {
                        font-size: 16px;
                        color: #4b5563;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .info-section ul {
                        list-style-type: disc;
                        padding-left: 20px;
                        text-align: left;
                        margin: 0 auto 20px;
                        max-width: 600px;
                        color: #4b5563;
                        font-size: 16px;
                    }
                    .info-section .quote {
                        font-size: 18px;
                        font-weight: 600;
                        color: #2563eb;
                        font-style: italic;
                    }
                    .info-section img {
                        max-width: 150px;
                        margin: 20px auto;
                        display: block;
                    }
                    .form-section {
                        background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
                    }
                    .form-section h2 {
                        font-size: 28px;
                        font-weight: 700;
                        color: #1e40af;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .form-section .subheader {
                        text-align: center;
                        color: #6b7280;
                        font-size: 16px;
                        margin-bottom: 30px;
                    }
                    .auth-message {
                        text-align: center;
                        font-size: 14px;
                        color: #4b5563;
                        margin-bottom: 20px;
                    }
                    .auth-message .auth-name {
                        font-weight: 600;
                        color: #2563eb;
                    }
                    .auth-message .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 10px;
                    }
                    .login-link, .logout-button {
                        display: inline-flex;
                        align-items: center;
                        padding: 10px 20px;
                        background: #2563eb;
                        color: #ffffff;
                        border-radius: 8px;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 600;
                        transition: background 0.3s ease, transform 0.3s ease;
                    }
                    .logout-button {
                        background: #dc2626;
                    }
                    .login-link:hover, .logout-button:hover {
                        background: #1e40af;
                        transform: translateY(-2px);
                    }
                    .logout-button:hover {
                        background: #b91c1c;
                    }
                    .login-link img, .logout-button img {
                        margin-right: 8px;
                    }
                    .form-table {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .form-table td {
                        padding: 10px 0;
                    }
                    .form-table label {
                        font-weight: 600;
                        color: #1f2937;
                        display: block;
                        margin-bottom: 8px;
                    }
                    .form-table textarea,
                    .form-table input[type="text"] {
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        padding: 12px;
                        width: 100%;
                        box-sizing: border-box;
                        font-size: 14px;
                        color: #1f2937;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    }
                    .form-table textarea:focus,
                    .form-table input[type="text"]:focus {
                        border-color: #2563eb;
                        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                        outline: none;
                    }
                    .form-table textarea {
                        resize: vertical;
                        min-height: 120px;
                    }
                    .form-table .input-container {
                        position: relative;
                    }
                    .form-table .input-container img {
                        position: absolute;
                        left: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                    }
                    .form-table .input-container input[type="text"] {
                        padding-left: 40px;
                    }
                    .form-table .error {
                        color: #dc2626;
                        font-size: 12px;
                        margin-top: 4px;
                        display: block;
                    }
                    .form-table .submit-button {
                        background: #2563eb;
                        color: #ffffff;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        width: 100%;
                        max-width: 300px;
                        margin: 20px auto 0;
                        transition: background 0.3s ease, transform 0.3s ease;
                    }
                    .form-table .submit-button:hover {
                        background: #1e40af;
                        transform: translateY(-2px);
                    }
                    .form-table .submit-button:disabled {
                        background: #d1d5db;
                        cursor: not-allowed;
                    }
                    .form-table .whatsapp-button {
                        background: #25D366;
                        color: #ffffff;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        width: 100%;
                        max-width: 300px;
                        margin: 20px auto 0;
                        transition: background 0.3s ease, transform 0.3s ease;
                    }
                    .form-table .whatsapp-button:hover:not(:disabled) {
                        background: #20b354;
                        transform: translateY(-2px);
                    }
                    .form-table .whatsapp-button:disabled {
                        background: #d1d5db;
                        color: #6b7280;
                        cursor: not-allowed;
                    }
                    .form-table .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        flex-wrap: wrap;
                    }
                    .success-toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #16a34a;
                        color: #ffffff;
                        padding: 12px 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        animation: fadeInOut 3s ease-in-out;
                        z-index: 1000;
                    }
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateY(-20px); }
                        10% { opacity: 1; transform: translateY(0); }
                        90% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-20px); }
                    }
                    @media (max-width: 768px) {
                        .main-container {
                            padding: 40px 15px;
                        }
                        .info-section, .form-section {
                            padding: 30px;
                        }
                        .info-section h2, .form-section h2 {
                            font-size: 24px;
                        }
                        .form-table .button-group {
                            flex-direction: column;
                            align-items: center;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                {/* Top Section: Counseling Information */}
                <div className="info-section">
                    <h2>Pentingnya Konseling</h2>
                    <p>
                        Konseling adalah proses yang membantu individu mengatasi masalah emosional, psikologis, atau sosial yang mereka hadapi. Dengan bantuan konselor, Anda dapat menemukan cara untuk mengelola stres, kecemasan, atau masalah hubungan yang mungkin memengaruhi kesejahteraan Anda.
                    </p>
                    <p>
                        Psikologi modern menunjukkan bahwa berbicara tentang masalah Anda dengan seseorang yang terlatih dapat membantu Anda mendapatkan perspektif baru, mengembangkan strategi koping yang sehat, dan meningkatkan kesehatan mental secara keseluruhan.
                    </p>
                    <img
                        src="https://img.icons8.com/color/96/000000/collaboration.png"
                        alt="Collaboration Image"
                    />
                    <h3>Manfaat Konseling</h3>
                    <ul>
                        <li>Meningkatkan kesadaran diri dan pemahaman emosi.</li>
                        <li>Mengurangi stres dan kecemasan melalui teknik relaksasi.</li>
                        <li>Memperbaiki hubungan interpersonal dengan komunikasi yang lebih baik.</li>
                        <li>Membantu mengatasi trauma atau pengalaman sulit di masa lalu.</li>
                        <li>Mendukung pengambilan keputusan yang lebih bijak.</li>
                    </ul>
                    <p className="quote">
                        "Kesehatan mental sama pentingnya dengan kesehatan fisik. Jangan ragu untuk mencari bantuan!"
                    </p>
                </div>

                {/* Bottom Section: Counseling Form */}
                <div className="form-section">
                    <h2>Formulir Konseling</h2>
                    <p className="subheader">
                        Silakan isi formulir berikut untuk meminta sesi konseling.
                    </p>
                    <div className="auth-message">
                        {auth.isMahasiswa ? (
                            <div>
                                <p>
                                    Anda login sebagai: <span className="auth-name">{auth.user.name}</span>
                                </p>
                                <div className="button-group">
                                    <button onClick={handleLogout} className="logout-button">
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/ffffff/logout-rounded-left.png"
                                            width="16"
                                            height="16"
                                            alt="Logout Icon"
                                        />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    Anda harus login sebagai mahasiswa untuk mengirimkan permintaan konseling.
                                </p>
                                <div className="button-group">
                                    <Link
                                        href={`${route('login')}?${new URLSearchParams({
                                            issue: formData.issue,
                                            noTelephone: formData.noTelephone,
                                        }).toString()}`}
                                        className="login-link"
                                    >
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/ffffff/login-rounded-right.png"
                                            width="16"
                                            height="16"
                                            alt="Login Icon"
                                        />
                                        Login Sekarang
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <table className="form-table">
                            <tr>
                                <td>
                                    <label htmlFor="issue">Masalah yang Ingin Dibahas</label>
                                    <textarea
                                        id="issue"
                                        name="issue"
                                        value={formData.issue}
                                        onChange={handleChange}
                                        placeholder="Jelaskan masalah yang ingin Anda bahas..."
                                        required
                                    />
                                    {errors.issue && <span className="error">{errors.issue}</span>}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="noTelephone">Nomor Telepon Anda</label>
                                    <div className="input-container">
                                        <img
                                            src="https://img.icons8.com/ios-filled/50/666666/phone.png"
                                            alt="Phone Icon"
                                        />
                                        <input
                                            type="text"
                                            id="noTelephone"
                                            name="noTelephone"
                                            value={formData.noTelephone}
                                            onChange={handleChange}
                                            placeholder="+6281234567890"
                                            required
                                        />
                                    </div>
                                    {errors.noTelephone && (
                                        <span className="error">{errors.noTelephone}</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="button-group">
                                        <button
                                            type="submit"
                                            disabled={!auth.isMahasiswa}
                                            className="submit-button"
                                        >
                                            <img
                                                src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                                                width="16"
                                                height="16"
                                                alt="Checkmark Icon"
                                            />
                                            Kirim Permintaan Konseling
                                        </button>
                                        <button
                                            onClick={handleWhatsAppContact}
                                            disabled={!isFormSubmitted}
                                            className="whatsapp-button"
                                        >
                                            <img
                                                src="https://img.icons8.com/color/48/000000/whatsapp.png"
                                                width="16"
                                                height="16"
                                                alt="WhatsApp Icon"
                                            />
                                            Hubungi via WhatsApp
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </form>
                </div>
            </div>

            {/* Success Notification */}
            {showSuccess && (
                <div className="success-toast">
                    <img
                        src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                        width="16"
                        height="16"
                        alt="Success Icon"
                    />
                    Permintaan konseling berhasil ditambahkan!
                </div>
            )}

            <FooterLayout />
        </GuestLayout>
    );
}