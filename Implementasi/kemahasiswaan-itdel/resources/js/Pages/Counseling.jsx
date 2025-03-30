import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import FooterLayout from '@/Layouts/FooterLayout';

export default function Counseling({ auth }) {
    // Initialize form data, checking for query parameters
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

        // If the user is not logged in or not a mahasiswa, redirect to login with form data in query params
        if (!auth.isMahasiswa) {
            const queryParams = new URLSearchParams({
                issue: formData.issue,
                noTelephone: formData.noTelephone,
            }).toString();
            router.get(`${route('login')}?${queryParams}`);
            return;
        }

        // Submit the form
        router.post(route('counseling.store'), formData, {
            onError: (errors) => {
                setErrors(errors);
            },
            onSuccess: () => {
                // Reset form after successful submission
                setFormData({ issue: '', noTelephone: '' });
                // Show success notification
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
            },
        });
    };

    // Logout function
    const handleLogout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                // Redirect to login page after logout
                router.get(route('login'));
            },
        });
    };

    // Clear query params from URL after loading form data
    useEffect(() => {
        if (initialIssue || initialNoTelephone) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [initialIssue, initialNoTelephone]);

    return (
        <GuestLayout>
            <NavbarGuestLayout />
            <Head title="Formulir Konseling" />

            {/* CSS Styles */}
            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
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
                        gap: 30px;
                    }
                    .form-section, .content-section {
                        background: #ffffff;
                        border-radius: 15px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    .form-section:hover, .content-section:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                    .header img {
                        vertical-align: middle;
                        margin-right: 10px;
                    }
                    .header h2 {
                        font-size: 28px;
                        font-weight: bold;
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .subheader {
                        text-align: center;
                        color: #666666;
                        font-size: 16px;
                        margin-bottom: 20px;
                    }
                    .auth-message {
                        text-align: center;
                        font-size: 14px;
                        color: #666666;
                        margin-bottom: 20px;
                    }
                    .auth-message .auth-name {
                        font-weight: bold;
                        color: #3498db;
                    }
                    .auth-message .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                    }
                    .login-link, .logout-button {
                        display: inline-flex;
                        align-items: center;
                        padding: 8px 15px;
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        color: #ffffff;
                        border-radius: 20px;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: bold;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        border: none;
                        cursor: pointer;
                    }
                    .logout-button {
                        background: linear-gradient(90deg, #e74c3c, #c0392b);
                    }
                    .login-link:hover, .logout-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    }
                    .login-link img, .logout-button img {
                        vertical-align: middle;
                        margin-right: 5px;
                    }
                    .form-table {
                        width: 100%;
                    }
                    .form-table td {
                        padding: 5px;
                    }
                    .form-table label {
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .form-table textarea,
                    .form-table input[type="text"] {
                        border: 1px solid #3498db;
                        border-radius: 8px;
                        padding: 10px;
                        width: 100%;
                        box-sizing: border-box;
                        font-size: 14px;
                        color: #333333;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    }
                    .form-table textarea:focus,
                    .form-table input[type="text"]:focus {
                        border-color: #2980b9;
                        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                        outline: none;
                    }
                    .form-table textarea {
                        resize: vertical;
                    }
                    .form-table .input-container {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                    }
                    .form-table .input-container img {
                        position: absolute;
                        left: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                    .form-table .input-container input[type="text"] {
                        padding-left: 35px;
                    }
                    .form-table .error {
                        color: #e74c3c;
                        font-size: 12px;
                        animation: pulse 1s infinite;
                    }
                    .form-table .submit-button {
                        background: linear-gradient(90deg, #3498db, #2980b9);
                        color: #ffffff;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 5px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    .form-table .submit-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    }
                    .form-table .submit-button:disabled {
                        background: #cccccc;
                        cursor: not-allowed;
                        box-shadow: none;
                    }
                    .form-table .submit-button img {
                        vertical-align: middle;
                    }
                    .content-section h3 {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                    .content-section h3 img {
                        vertical-align: middle;
                        margin-right: 10px;
                    }
                    .content-section p {
                        text-align: justify;
                        color: #666666;
                        font-size: 16px;
                        margin-bottom: 15px;
                    }
                    .content-section img {
                        display: block;
                        margin: 0 auto 20px;
                    }
                    .content-section ul {
                        list-style-type: disc;
                        padding-left: 20px;
                        color: #666666;
                        font-size: 16px;
                        margin-bottom: 20px;
                    }
                    .content-section .quote {
                        text-align: center;
                        font-size: 16px;
                        font-weight: bold;
                        color: #3498db;
                    }
                    .success-toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #28a745;
                        color: #ffffff;
                        padding: 15px 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        animation: fadeInOut 3s ease-in-out;
                        z-index: 1000;
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateY(-20px); }
                        10% { opacity: 1; transform: translateY(0); }
                        90% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-20px); }
                    }
                    @media (max-width: 768px) {
                        .grid-container {
                            grid-template-columns: 1fr;
                        }
                    }
                `}
            </style>

            {/* Main Container */}
            <div className="main-container">
                <div className="grid-container">
                    {/* Left Side: Form Section */}
                    <div className="form-section">
                        <div className="header">
                            <img
                                src="https://img.icons8.com/fluency/48/000000/chat.png"
                                width="30"
                                height="30"
                                alt="Chat Icon"
                            />
                            <h2>Formulir Konseling</h2>
                        </div>
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
                        <form onSubmit={handleSubmit}>
                            <table className="form-table">
                                {/* Issue Field */}
                                <tr>
                                    <td>
                                        <label htmlFor="issue">Masalah yang Ingin Dibahas</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <textarea
                                            id="issue"
                                            name="issue"
                                            rows="5"
                                            value={formData.issue}
                                            onChange={handleChange}
                                            placeholder="Jelaskan masalah yang ingin Anda bahas..."
                                            required
                                        ></textarea>
                                    </td>
                                </tr>
                                {errors.issue && (
                                    <tr>
                                        <td>
                                            <span className="error">{errors.issue}</span>
                                        </td>
                                    </tr>
                                )}

                                {/* Telephone Field */}
                                <tr>
                                    <td>
                                        <label htmlFor="noTelephone">Nomor Telepon</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="input-container">
                                            <img
                                                src="https://img.icons8.com/ios-filled/50/666666/phone.png"
                                                width="20"
                                                height="20"
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
                                    </td>
                                </tr>
                                {errors.noTelephone && (
                                    <tr>
                                        <td>
                                            <span className="error">{errors.noTelephone}</span>
                                        </td>
                                    </tr>
                                )}

                                {/* Submit Button */}
                                <tr>
                                    <td align="center">
                                        <button
                                            type="submit"
                                            disabled={!auth.isMahasiswa}
                                            className="submit-button"
                                        >
                                            <img
                                                src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                                                width="20"
                                                height="20"
                                                alt="Checkmark Icon"
                                            />
                                            Kirim Permintaan Konseling
                                        </button>
                                    </td>
                                </tr>
                            </table>
                        </form>
                    </div>

                    {/* Right Side: Counseling Content Section */}
                    <div className="content-section">
                        <h3>
                            <img
                                src="https://img.icons8.com/?size=100&id=JhPEC7MuLxCC&format=png&color=000000"
                                width="200"
                                height="200"
                                alt="Mental Health Icon"
                            />
                            Pentingnya Konseling
                        </h3>
                        <p>
                            Konseling adalah proses yang membantu individu untuk mengatasi masalah emosional, psikologis, atau sosial yang mereka hadapi. Dengan bantuan konselor, Anda dapat menemukan cara untuk mengelola stres, kecemasan, atau masalah hubungan yang mungkin memengaruhi kesejahteraan Anda.
                        </p>
                        <p>
                            Psikologi modern menunjukkan bahwa berbicara tentang masalah Anda dengan seseorang yang terlatih dapat membantu Anda mendapatkan perspektif baru, mengembangkan strategi koping yang sehat, dan meningkatkan kesehatan mental secara keseluruhan.
                        </p>
                        <img
                            src="https://img.icons8.com/color/96/000000/collaboration.png"
                            width="150"
                            height="150"
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
                </div>
            </div>

            {/* Success Notification */}
            {showSuccess && (
                <div className="success-toast">
                    <img
                        src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                        width="20"
                        height="20"
                        alt="Success Icon"
                    />
                    Permintaan konseling berhasil ditambahkan!
                </div>
            )}

            <FooterLayout />
        </GuestLayout>
    );
}