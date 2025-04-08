import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import FooterLayout from '@/Layouts/FooterLayout';

export default function Aspiration({ auth }) {
    // Initialize form data, checking for query parameters
    const { props } = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const initialStory = urlParams.get('story') || '';
    const initialNoTelephone = urlParams.get('noTelephone') || '';

    const [formData, setFormData] = useState({
        story: initialStory,
        noTelephone: initialNoTelephone,
    });

    const [errors, setErrors] = useState({});

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
                story: formData.story,
                noTelephone: formData.noTelephone,
            }).toString();
            router.get(`${route('login')}?${queryParams}`);
            return;
        }

        // Submit the form
        router.post(route('aspiration.store'), formData, {
            onError: (errors) => {
                setErrors(errors);
            },
            onSuccess: () => {
                // Reset form after successful submission
                setFormData({ story: '', noTelephone: '' });
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
        if (initialStory || initialNoTelephone) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [initialStory, initialNoTelephone]);

    return (
        <GuestLayout>
            <NavbarGuestLayout />
            <Head title="Formulir Aspirasi" />

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
                                src="data:image/png;base64,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"
                                width="30"
                                height="30"

                                alt="Idea Icon"
                            />
                            <h2>Formulir Aspirasi</h2>
                        </div>
                        <p className="subheader">
                            Silakan isi formulir berikut untuk menyampaikan aspirasi Anda.
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
                                        Anda harus login sebagai mahasiswa untuk menyampaikan aspirasi.
                                    </p>
                                    <div className="button-group">
                                        <Link
                                            href={`${route('login')}?${new URLSearchParams({
                                                story: formData.story,
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
                                {/* Story Field */}
                                <tr>
                                    <td>
                                        <label htmlFor="story">Cerita Aspirasi Anda</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <textarea
                                            id="story"
                                            name="story"
                                            rows="5"
                                            value={formData.story}
                                            onChange={handleChange}
                                            placeholder="Ceritakan aspirasi atau ide Anda..."
                                            required
                                        ></textarea>
                                    </td>
                                </tr>
                                {errors.story && (
                                    <tr>
                                        <td>
                                            <span className="error">{errors.story}</span>
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
                                            Kirim Aspirasi
                                        </button>
                                    </td>
                                </tr>
                            </table>
                        </form>
                    </div>

                    {/* Right Side: Aspiration Content Section */}
                    <div className="content-section">
                        <h3>
                            <img
                                src="https://img.icons8.com/?size=100&id=10884&format=png&color=000000"
                                width="200"
                                height="200"
                                alt="Idea Icon"
                            />
                            Pentingnya Menyampaikan Aspirasi
                        </h3>
                        <p>
                            Aspirasi adalah cara bagi Anda untuk menyampaikan ide, saran, atau kritik yang dapat membantu meningkatkan kualitas lingkungan akademik dan sosial di kampus. Dengan menyampaikan aspirasi, Anda berkontribusi dalam menciptakan perubahan positif.
                        </p>
                        <p>
                            Setiap suara mahasiswa sangat berarti. Aspirasi Anda dapat menjadi inspirasi bagi perbaikan sistem, kegiatan kemahasiswaan, atau bahkan kebijakan kampus yang lebih baik.
                        </p>
                        <img
                            src="https://img.icons8.com/color/96/000000/idea-sharing.png"
                            width="150"
                            height="150"
                            alt="Idea Sharing Image"
                        />
                        <h3>Manfaat Menyampaikan Aspirasi</h3>
                        <ul>
                            <li>Mendorong perubahan positif di lingkungan kampus.</li>
                            <li>Meningkatkan keterlibatan mahasiswa dalam pengambilan keputusan.</li>
                            <li>Mempererat hubungan antara mahasiswa dan pihak kemahasiswaan.</li>
                            <li>Membantu menyelesaikan masalah yang dihadapi mahasiswa.</li>
                            <li>Menciptakan lingkungan akademik yang lebih inklusif.</li>
                        </ul>
                        <p className="quote">
                            "Suara Anda adalah kekuatan untuk perubahan. Jangan ragu untuk berbicara!"
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Notification */}
            {props.flash?.success && (
                <div className="success-toast">
                    <img
                        src="https://img.icons8.com/ios-filled/50/ffffff/checkmark.png"
                        width="20"
                        height="20"
                        alt="Success Icon"
                    />
                    {props.flash.success}
                </div>
            )}

            <FooterLayout />
        </GuestLayout>
    );
}
