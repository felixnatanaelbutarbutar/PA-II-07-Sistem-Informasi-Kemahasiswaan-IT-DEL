import { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Navbar from '@/Layouts/Navbar';
import FooterLayout from '@/Layouts/FooterLayout';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function Counseling({ auth, flash: initialFlash, errors: serverErrors, redirectToLogin }) {
    const { props } = usePage();
    const { counselings } = props;
    const urlParams = new URLSearchParams(window.location.search);
    const initialIssue = urlParams.get('issue') || '';
    const initialNoWhatsApp = urlParams.get('noWhatsApp') || '';

    // Update available times: 08:00 to 16:00, skipping 12:00
    const availableTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start from H+1

    // Use input type="date", so we don't need availableDates array anymore
    const minDate = tomorrow.toISOString().split('T')[0]; // Minimum date is tomorrow

    const [formData, setFormData] = useState({
        issue: initialIssue,
        noWhatsApp: initialNoWhatsApp,
        bookingDate: minDate,
        bookingTime: availableTimes[0] || '',
    });
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [flash, setFlash] = useState(initialFlash || {});
    const [activeTab, setActiveTab] = useState('info');
    const [metaData, setMetaData] = useState(null); // State untuk data meta
    const [metaError, setMetaError] = useState(null); // State untuk error meta
    const [isMetaLoading, setIsMetaLoading] = useState(true); // State untuk loading meta

    // Fetch meta data when component mounts
    useEffect(() => {
        const fetchMetaData = async () => {
            setIsMetaLoading(true);
            try {
                const metaResponse = await fetch('https://kemahasiswaanitdel.site/api/meta/konseling');
                if (!metaResponse.ok) {
                    throw new Error('Gagal mengambil data meta konseling');
                }
                const metaData = await metaResponse.json();
                setMetaData(metaData);
            } catch (err) {
                setMetaError(err.message);
            } finally {
                setIsMetaLoading(false);
            }
        };

        fetchMetaData();
    }, []);

    useEffect(() => {
        if (redirectToLogin) {
            const queryParams = new URLSearchParams({
                issue: formData.issue,
                noWhatsApp: formData.noWhatsApp,
                bookingDate: formData.bookingDate,
                bookingTime: formData.bookingTime,
            }).toString();
            router.get(`${route('login')}?${queryParams}`);
        }
    }, [redirectToLogin, formData]);

    useEffect(() => {
        const flashFromProps = props.flash || {};
        setFlash(flashFromProps);

        if (flashFromProps?.success) {
            setShowSuccess(true);
            setIsFormSubmitted(true);
            setErrors({});
            setTimeout(() => setShowSuccess(false), 3000);
        }

        if (flashFromProps?.error || serverErrors?.general || serverErrors?.auth) {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    }, [props.flash, serverErrors]);

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
        router.post(route('counseling.store'), formData, {
            onBefore: () => {
                setErrors({});
                setShowError(false);
            },
            onSuccess: (page) => {
                setFormData({
                    issue: '',
                    noWhatsApp: '',
                    bookingDate: minDate,
                    bookingTime: availableTimes[0] || '',
                });
            },
            onError: (newErrors) => {
                setErrors(newErrors);
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
        if (initialIssue || initialNoWhatsApp) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [initialIssue, initialNoWhatsApp]);

    const handleWhatsAppContact = (e) => {
        e.preventDefault();
        if (!isFormSubmitted) return;
        const phoneNumber = '+6285142232595';
        const message = `Halo, saya ${auth.user?.name || 'pengguna'} telah mengisi formulir konseling untuk tanggal ${formData.bookingDate} pukul ${formData.bookingTime}. Bisakah Anda membantu saya untuk langkah selanjutnya?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const approvedCounselings = useMemo(() => {
        return counselings?.data?.filter((counseling) => counseling.status === 'disetujui') || [];
    }, [counselings]);

    const events = useMemo(() => {
        const eventsList = [];
        const bookingsByDate = {};

        approvedCounselings.forEach((counseling) => {
            const date = counseling.booking_date;
            if (!bookingsByDate[date]) {
                bookingsByDate[date] = [];
            }
            bookingsByDate[date].push(counseling);
        });

        Object.keys(bookingsByDate).forEach((date) => {
            const bookings = bookingsByDate[date];
            const bookedTimes = bookings.map((b) => b.booking_time);

            if (bookedTimes.length >= availableTimes.length) {
                eventsList.push({
                    title: 'Full Booked',
                    start: new Date(date),
                    end: new Date(date),
                    allDay: true,
                    resource: { isFull: true },
                });
            } else {
                bookings.forEach((counseling) => {
                    const start = moment(`${date} ${counseling.booking_time}`).toDate();
                    const end = moment(start).add(1, 'hour').toDate();
                    eventsList.push({
                        title: `${counseling.booking_time} - Disetujui`,
                        start: start,
                        end: end,
                        resource: { isBooked: true },
                    });
                });
            }
        });

        return eventsList;
    }, [approvedCounselings]);

    const handleSelectSlot = ({ start }) => {
        const dateStr = moment(start).format('YYYY-MM-DD');
        const bookingsOnDate = approvedCounselings.filter(
            (counseling) => counseling.booking_date === dateStr
        );

        const booked = bookingsOnDate.map((counseling) => ({
            time: counseling.booking_time.split(':').slice(0, 2).join(':'),
            nim: counseling.user?.nim || 'Tidak diketahui',
            name: counseling.user?.name || 'Tidak diketahui',
        }));

        const bookedTimes = booked.map((b) => b.time);
        const available = availableTimes.filter((slot) => !bookedTimes.includes(slot));

        setSelectedDate(dateStr);
        setAvailableSlots(available);
        setBookedSlots(booked);
    };

    const eventPropGetter = (event) => {
        if (event.resource?.isFull) {
            return {
                style: {
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                },
            };
        } else if (event.resource?.isBooked) {
            return {
                style: {
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                },
            };
        }
        return {};
    };

    return (
        <GuestLayout>
            <Navbar />
            <Head title="Formulir Konseling" />

            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Inter', Arial, sans-serif;
                        background: #f0f9ff;
                        color: #1e293b;
                    }
                    .main-container {
                        min-height: 100vh;
                        padding: 40px 20px 80px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%);
                        width: 100%;
                    }
                    .tab-navigation {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-bottom: 30px;
                        width: 100%;
                        max-width: 1400px;
                        background: #fff;
                        padding: 10px;
                        border-radius: 15px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    }
                    .tab-button {
                        padding: 12px 24px;
                        background: transparent;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        color: #475569;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .tab-button:hover {
                        background: #f0f9ff;
                        transform: translateY(-2px);
                    }
                    .tab-button.active {
                        background: #0ea5e9;
                        color: #fff;
                        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
                    }
                    .content-section {
                        max-width: 1400px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 20px;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                        padding: 40px;
                        margin-bottom: 40px;
                        transition: all 0.3s ease;
                        animation: fadeIn 0.5s ease;
                    }
                    .info-section {
                        text-align: center;
                    }
                    .info-section .meta-container {
                        position: relative;
                        background: #ffffff;
                        border-radius: 20px;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                        padding: 40px;
                        text-align: center;
                        overflow: hidden;
                        border: 1px solid #e0f2fe;
                        transition: transform 0.3s ease;
                    }
                    .info-section .meta-container:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
                    }
                    .info-section .meta-container::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%);
                        z-index: 0;
                    }
                    .info-section .meta-content {
                        position: relative;
                        z-index: 1;
                    }
                    .info-section .meta-icon {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 64px;
                        height: 64px;
                        background: linear-gradient(135deg, #0ea5e9, #0284c7);
                        border-radius: 50%;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
                        animation: bounceIn 1s ease;
                    }
                    @keyframes bounceIn {
                        0% { transform: scale(0); opacity: 0; }
                        60% { transform: scale(1.2); opacity: 1; }
                        100% { transform: scale(1); }
                    }
                    .info-section .meta-icon svg {
                        width: 32px;
                        height: 32px;
                        color: #ffffff;
                    }
                    .info-section .meta-title {
                        font-size: 36px;
                        font-weight: 800;
                        color: #0369a1;
                        margin-bottom: 15px;
                        animation: slideIn 1s ease;
                    }
                    .info-section .meta-description {
                        font-size: 18px;
                        color: #475569;
                        max-width: 800px;
                        margin: 0 auto 30px;
                        line-height: 1.6;
                        animation: fadeIn 1s ease 0.3s forwards;
                        opacity: 0;
                    }
                    .info-section .meta-image-container {
                        margin-top: 0;
                        display: flex;
                        justify-content: center;
                    }
                    .info-section .meta-image {
                        max-width: 300px;
                        max-height: 300px;
                        border-radius: 15px;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
                        transition: transform 0.3s ease;
                        object-fit: cover;
                    }
                    .info-section .meta-image:hover {
                        transform: scale(1.05);
                    }
                    .info-section .meta-error {
                        background: #fef2f2;
                        border: 1px solid #fee2e2;
                        border-radius: 15px;
                        padding: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        color: #dc2626;
                        font-size: 16px;
                        font-weight: 500;
                    }
                    .info-section .meta-loading {
                        background: #f0f9ff;
                        border-radius: 15px;
                        padding: 40px;
                        text-align: center;
                    }
                    .info-section .meta-loading .spinner {
                        width: 64px;
                        height: 64px;
                        border: 4px solid #e0f2fe;
                        border-top: 4px solid #0ea5e9;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .info-section .meta-loading .placeholder {
                        height: 24px;
                        background: #e0f2fe;
                        border-radius: 8px;
                        margin: 10px auto;
                        animation: pulse 1.5s infinite;
                    }
                    .info-section .meta-loading .placeholder.title {
                        width: 50%;
                        max-width: 300px;
                    }
                    .info-section .meta-loading .placeholder.description {
                        width: 70%;
                        max-width: 500px;
                    }
                    @keyframes pulse {
                        0% { opacity: 0.6; }
                        50% { opacity: 1; }
                        100% { opacity: 0.6; }
                    }
                    .info-section h2 {
                        font-size: 32px;
                        font-weight: 700;
                        color: #0369a1;
                        margin-bottom: 30px;
                        position: relative;
                        display: block;
                        width: 100%;
                    }
                    .info-section h2:after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 100px;
                        height: 4px;
                        background: linear-gradient(90deg, #0ea5e9, #0284c7);
                        border-radius: 2px;
                    }
                    .info-cards {
                        display: flex;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                        gap: 30px;
                        margin: 40px 0;
                    }
                    .info-card {
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        border-radius: 16px;
                        padding: 30px;
                        width: 33.33%;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        transition: all 0.3s ease;
                        text-align: center;
                        box-sizing: border-box;
                    }
                    .info-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    }
                    .info-card img {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 20px;
                        display: block;
                    }
                    .info-card h3 {
                        font-size: 22px;
                        font-weight: 700;
                        color: #0369a1;
                        margin-bottom: 15px;
                    }
                    .info-card p {
                        font-size: 16px;
                        color: #475569;
                        line-height: 1.6;
                    }
                    .info-section h3 {
                        font-size: 24px;
                        font-weight: 600;
                        color: #0369a1;
                        margin: 40px 0 20px;
                    }
                    .info-section p {
                        font-size: 16px;
                        color: #475569;
                        line-height: 1.7;
                        margin-bottom: 20px;
                        max-width: 800px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .info-section ul {
                        list-style-type: none;
                        padding: 0;
                        margin: 20px auto 30px;
                        max-width: 700px;
                        text-align: left;
                    }
                    .info-section ul li {
                        padding: 12px 0 12px 40px;
                        color: #475569;
                        font-size: 16px;
                        position: relative;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .info-section ul li:before {
                        content: '';
                        width: 24px;
                        height: 24px;
                        background-image: url('https://img.icons8.com/color/48/000000/checkmark.png');
                        background-size: contain;
                        position: absolute;
                        left: 0;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                    .info-section .quote {
                        font-size: 20px;
                        font-weight: 500;
                        color: #0369a1;
                        font-style: italic;
                        position: relative;
                        padding: 30px;
                        margin: 40px auto;
                        max-width: 700px;
                        background: #f0f9ff;
                        border-radius: 16px;
                        border-left: 5px solid #0ea5e9;
                    }
                    .info-section .quote:before {
                        content: '"';
                        position: absolute;
                        top: -10px;
                        left: 20px;
                        font-size: 80px;
                        color: rgba(14, 165, 233, 0.2);
                        font-family: Georgia, serif;
                    }
                    .info-section .location-card {
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        border-radius: 16px;
                        padding: 30px;
                        margin: 40px auto;
                        max-width: 600px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                        text-align: center;
                    }
                    .info-section .location-card img {
                        width: 60px;
                        height: 60px;
                        margin-bottom: 20px;
                    }
                    .info-section .location-card h3 {
                        font-size: 22px;
                        font-weight: 600;
                        color: #0369a1;
                        margin-bottom: 15px;
                    }
                    .info-section .location-card p {
                        font-size: 16px;
                        color: #475569;
                        line-height: 1.6;
                    }
                    .calendar-section h2 {
                        font-size: 28px;
                        font-weight: 700;
                        color: #0369a1;
                        text-align: center;
                        margin-bottom: 20px;
                        position: relative;
                        display: block;
                        width: 100%;
                    }
                    .calendar-section h2:after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 80px;
                        height: 4px;
                        background: linear-gradient(90deg, #0ea5e9, #0284c7);
                        border-radius: 2px;
                    }
                    .calendar-section .subheader {
                        text-align: center;
                        color: #64748b;
                        font-size: 16px;
                        margin-bottom: 30px;
                    }
                    .rbc-calendar {
                        font-family: 'Inter', Arial, sans-serif;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                        background: #fff;
                    }
                    .rbc-month-view, .rbc-header, .rbc-day-bg {
                        border-color: #e2e8f0 !important;
                    }
                    .rbc-header {
                        font-size: 14px;
                        font-weight: 600;
                        color: #0369a1;
                        padding: 12px !important;
                        background: #f0f9ff;
                    }
                    .rbc-date-cell {
                        font-size: 14px;
                        color: #334155;
                        padding: 5px !important;
                    }
                    .rbc-today {
                        background-color: #e0f2fe !important;
                    }
                    .rbc-event {
                        padding: 4px 8px !important;
                        border-radius: 8px !important;
                    }
                    .rbc-day-bg:hover:not(.rbc-off-range-bg) {
                        background-color: #e0f2fe !important;
                        cursor: pointer;
                    }
                    .modal-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(5px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        animation: fadeIn 0.3s ease;
                    }
                    .modal-content {
                        background: #ffffff;
                        border-radius: 20px;
                        padding: 30px;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                        transform: translateY(0);
                        animation: slideUp 0.3s ease;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .modal-content h3 {
                        font-size: 22px;
                        font-weight: 600;
                        color: #0369a1;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .modal-content h4 {
                        font-size: 18px;
                        font-weight: 600;
                        color: #0369a1;
                        margin-bottom: 10px;
                    }
                    .modal-content ul {
                        list-style: none;
                        padding: 0;
                        margin: 0 0 25px;
                    }
                    .modal-content li {
                        padding: 14px;
                        border-radius: 10px;
                        margin-bottom: 10px;
                        text-align: center;
                        font-size: 16px;
                        font-weight: 500;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                        transition: all 0.2s ease;
                        cursor: pointer;
                    }
                    .modal-content .available-slot {
                        background: #f0fdf4;
                        color: #16a34a;
                    }
                    .modal-content .booked-slot {
                        background: #fee2e2;
                        color: #dc2626;
                    }
                    .modal-content li:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                    .modal-content .slot-info {
                        font-size: 14px;
                        color: #475569;
                        margin-top: 5px;
                    }
                    .modal-content button {
                        display: block;
                        margin: 0 auto;
                        padding: 12px 24px;
                        background: #0ea5e9;
                        color: #ffffff;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .modal-content button:hover {
                        background: #0284c7;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
                    }
                    .form-section {
                        background: #ffffff;
                        border-radius: 20px;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    }
                    .form-section h2 {
                        font-size: 28px;
                        font-weight: 700;
                        color: #0369a1;
                        text-align: center;
                        margin-bottom: 20px;
                        position: relative;
                        display: block;
                        width: 100%;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .form-section h2:after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 80px;
                        height: 4px;
                        background: linear-gradient(90deg, #0ea5e9, #0284c7);
                        border-radius: 2px;
                    }
                    .form-section .subheader {
                        text-align: center;
                        color: #64748b;
                        font-size: 16px;
                        margin-bottom: 30px;
                    }
                    .auth-message {
                        text-align: center;
                        background: #f0f9ff;
                        padding: 20px;
                        border-radius: 14px;
                        margin-bottom: 30px;
                    }
                    .auth-message p {
                        font-size: 16px;
                        color: #475569;
                        margin-bottom: 10px;
                    }
                    .auth-message .auth-name {
                        font-weight: 600;
                        color: #0284c7;
                    }
                    .auth-message .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .login-link, .logout-button {
                        display: inline-flex;
                        align-items: center;
                        padding: 12px 24px;
                        background: #0ea5e9;
                        color: #ffffff;
                        border-radius: 10px;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        border: none;
                        cursor: pointer;
                    }
                    .logout-button {
                        background: #ef4444;
                    }
                    .login-link:hover, .logout-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 6px 15px rgba(14, 165, 233, 0.2);
                    }
                    .logout-button:hover {
                        box-shadow: 0 6px 15px rgba(239, 68, 68, 0.2);
                    }
                    .login-link img, .logout-button img {
                        margin-right: 8px;
                        width: 20px;
                        height: 20px;
                    }
                    .form-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 25px;
                        width: 100%;
                        max-width: 700px;
                        margin: 0 auto;
                    }
                    .form-group {
                        width: 100%;
                    }
                    .form-group label {
                        font-weight: 600;
                        color: #334155;
                        display: block;
                        margin-bottom: 10px;
                        font-size: 16px;
                    }
                    .form-group textarea,
                    .form-group input[type="text"],
                    .form-group input[type="date"],
                    .form-group select {
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 14px;
                        width: 100%;
                        box-sizing: border-box;
                        font-size: 16px;
                        color: #334155;
                        transition: all 0.3s ease;
                        background: #f8fafc;
                    }
                    .form-group textarea:focus,
                    .form-group input[type="text"]:focus,
                    .form-group input[type="date"]:focus,
                    .form-group select:focus {
                        border-color: #0ea5e9;
                        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
                        outline: none;
                        background: #ffffff;
                    }
                    .form-group textarea {
                        resize: vertical;
                        min-height: 150px;
                    }
                    .form-group .input-container {
                        position: relative;
                    }
                    .form-group .input-container img {
                        position: absolute;
                        left: 14px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 24px;
                        height: 24px;
                    }
                    .form-group .input-container input[type="text"] {
                        padding-left: 48px;
                    }
                    .form-group .error {
                        color: #ef4444;
                        font-size: 14px;
                        margin-top: 6px;
                        display: block;
                    }
                    .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-top: 30px;
                        flex-wrap: wrap;
                    }
                    .submit-button {
                        background: linear-gradient(to right, #0ea5e9, #0284c7);
                        color: #ffffff;
                        padding: 14px 28px;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        min-width: 220px;
                        transition: all 0.3s ease;
                    }
                    .submit-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
                    }
                    .submit-button:disabled {
                        background: #cbd5e1;
                        cursor: not-allowed;
                        transform: none;
                        box-shadow: none;
                    }
                    .whatsapp-button {
                        background: linear-gradient(to right, #25D366, #128C7E);
                        color: #ffffff;
                        padding: 14px 28px;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        min-width: 220px;
                        transition: all 0.3s ease;
                    }
                    .whatsapp-button:hover:not(:disabled) {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
                    }
                    .whatsapp-button:disabled {
                        background: #cbd5e1;
                        color: #64748b;
                        cursor: not-allowed;
                        transform: none;
                        box-shadow: none;
                    }
                    .success-toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #16a34a;
                        color: #ffffff;
                        padding: 16px 24px;
                        border-radius: 12px;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        animation: toastFadeInOut 3s ease-in-out;
                        z-index: 1000;
                        font-size: 16px;
                        font-weight: 500;
                    }
                    .error-toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #ef4444;
                        color: #ffffff;
                        padding: 16px 24px;
                        border-radius: 12px;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        animation: toastFadeInOut 3s ease-in-out;
                        z-index: 1000;
                        font-size: 16px;
                        font-weight: 500;
                    }
                    @keyframes toastFadeInOut {
                        0% { opacity: 0; transform: translateX(20px); }
                        10% { opacity: 1; transform: translateX(0); }
                        90% { opacity: 1; transform: translateX(0); }
                        100% { opacity: 0; transform: translateX(20px); }
                    }
                    @media (max-width: 1024px) {
                        .info-cards {
                            flex-wrap: wrap;
                            justify-content: center;
                        }
                        .info-card {
                            width: 100%;
                            max-width: 340px;
                        }
                        .info-section .meta-image {
                            max-width: 250px;
                            max-height: 250px;
                        }
                    }
                    @media (max-width: 768px) {
                        .main-container {
                            padding: 30px 15px;
                        }
                        .tab-navigation {
                            flex-wrap: wrap;
                            gap: 10px;
                            padding: 8px;
                            max-width: 100%;
                        }
                        .tab-button {
                            padding: 10px 16px;
                            font-size: 14px;
                        }
                        .content-section {
                            padding: 20px;
                            max-width: 100%;
                        }
                        .info-section h2, .form-section h2, .calendar-section h2 {
                            font-size: 24px;
                        }
                        .info-cards {
                            gap: 20px;
                        }
                        .info-card {
                            padding: 20px;
                            max-width: 100%;
                        }
                        .info-card img {
                            width: 60px;
                            height: 60px;
                        }
                        .info-section .quote {
                            font-size: 18px;
                            padding: 20px;
                        }
                        .form-grid {
                            gap: 15px;
                        }
                        .form-group label {
                            font-size: 14px;
                        }
                        .form-group textarea,
                        .form-group input[type="text"],
                        .form-group input[type="date"],
                        .form-group select {
                            padding: 12px;
                            font-size: 14px;
                        }
                        .button-group {
                            flex-direction: column;
                            gap: 15px;
                        }
                        .submit-button, .whatsapp-button {
                            min-width: 100%;
                            padding: 12px 20px;
                            font-size: 14px;
                        }
                        .rbc-month-view {
                            font-size: 12px;
                        }
                        .rbc-header {
                            font-size: 12px;
                            padding: 8px !important;
                        }
                        .rbc-event {
                            font-size: 10px;
                            padding: 2px 4px !important;
                        }
                        .info-section .meta-image {
                            max-width: 200px;
                            max-height: 200px;
                        }
                    }
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>

            <div className="main-container">
                <div className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <img
                            src="https://img.icons8.com/ios-filled/50/000000/info.png"
                            width="20"
                            height="20"
                            alt="Info Icon"
                        />
                        Informasi
                    </button>
                    {auth.isMahasiswa && (
                        <button
                            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calendar')}
                        >
                            <img
                                src="https://img.icons8.com/ios-filled/50/000000/calendar.png"
                                width="20"
                                height="20"
                                alt="Calendar Icon"
                            />
                            Kalender
                        </button>
                    )}
                    <button
                        className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
                        onClick={() => setActiveTab('form')}
                    >
                        <img
                            src="https://img.icons8.com/ios-filled/50/000000/form.png"
                            width="20"
                            height="20"
                            alt="Form Icon"
                        />
                        Formulir
                    </button>
                </div>

                {activeTab === 'info' && (
                    <div className="content-section info-section">
                        {metaError ? (
                            <div className="meta-error">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {metaError}
                            </div>
                        ) : isMetaLoading ? (
                            <div className="meta-loading">
                                <div className="spinner"></div>
                                <div className="placeholder title"></div>
                                <div className="placeholder description"></div>
                            </div>
                        ) : (
                            <div className="meta-container">
                                <div className="meta-content">
                                    <div className="meta-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <h2 className="meta-title">{metaData.meta_title || 'Pentingnya Konseling'}</h2>
                                    <div
                                        className="meta-description"
                                        dangerouslySetInnerHTML={{ __html: metaData.meta_description || 'Konseling adalah proses yang membantu individu mengatasi tantangan emosional, psikologis, atau sosial. Dengan bimbingan konselor, Anda dapat menemukan solusi untuk masalah yang memengaruhi kesejahteraan dan produktivitas Anda.' }}
                                    />
                                    {metaData.file_path && (
                                        <div className="meta-image-container">
                                            <img
                                                src={`/storage/${metaData.file_path}`}
                                                alt="Counselor Image"
                                                className="meta-image"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="content-section info-section">
                            <h2>Manfaat Bimbingan dan Konseling</h2>
                            <div className="info-cards">
                                <div className="info-card">
                                    <img
                                        src="/assets/images/icon/graduated-student-svgrepo-com.svg"
                                        alt="Academic Support Icon"
                                    />
                                    <h3>Dukungan Akademik</h3>
                                    <p>
                                        Membantu Anda mengatasi tantangan akademik, seperti kesulitan belajar, manajemen waktu, atau tekanan ujian, untuk mencapai potensi maksimal.
                                    </p>
                                </div>
                                <div className="info-card">
                                    <img
                                        src="/assets/images/icon/brain-inside-head-think-mentality-brain-svgrepo-com.svg"
                                        alt="Emotional Wellbeing Icon"
                                    />
                                    <h3>Kesejahteraan Emosional</h3>
                                    <p>
                                        Memberikan ruang aman untuk mengekspresikan emosi, mengelola stres, dan membangun ketahanan emosional.
                                    </p>
                                </div>
                                <div className="info-card">
                                    <img
                                        src="/assets/images/icon/strategy-project-develop-idea-svgrepo-com.svg"
                                        alt="Personal Development Icon"
                                    />
                                    <h3>Pengembangan Diri</h3>
                                    <p>
                                        Mendukung Anda dalam menemukan tujuan, meningkatkan kepercayaan diri, dan mengembangkan keterampilan interpersonal.
                                    </p>
                                </div>
                            </div>
                            <h3>Masalah yang Dapat Dibahas dalam Konseling</h3>
                            <ul>
                                <li><strong>Kecemasan:</strong> Mengatasi rasa cemas berlebih yang mengganggu aktivitas sehari-hari.</li>
                                <li><strong>Stres:</strong> Menemukan strategi untuk mengelola tekanan dari berbagai aspek kehidupan.</li>
                                <li><strong>Kejenuhan:</strong> Mengatasi rasa bosan atau kehilangan motivasi dalam studi atau kegiatan.</li>
                                <li><strong>Masalah Asrama:</strong> Menyelesaikan konflik dengan teman sekamar atau menyesuaikan diri dengan lingkungan asrama.</li>
                                <li><strong>Masalah Perkuliahan:</strong> Mengatasi tantangan akademik, seperti kesulitan belajar atau tekanan tugas.</li>
                                <li><strong>Masalah Relasi:</strong> Memperbaiki hubungan dengan teman, keluarga, atau pasangan.</li>
                            </ul>
                            <p className="quote">
                                "Saat masalah Anda sudah mengganggu aktivitas atau produktivitas sehari-hari, jangan ragu untuk mengakses atau menghubungi layanan konseling."
                            </p>
                            <div className="location-card">
                                <img
                                    src="https://img.icons8.com/color/96/000000/marker.png"
                                    alt="Location Icon"
                                />
                                <h3>Lokasi Ruangan Konseling</h3>
                                <p>
                                    Gedung 5, Lantai 2 (di antara Gedung 525 dan 526). Silakan datang 10 menit sebelum sesi dimulai.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && auth.isMahasiswa && (
                    <div className="content-section calendar-section">
                        <h2>Kalender Konseling</h2>
                        <p className="subheader">
                            Berikut adalah jadwal konseling yang telah disetujui. Klik tanggal untuk melihat jam yang tersedia.
                        </p>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500 }}
                            eventPropGetter={eventPropGetter}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            views={['month']}
                            defaultView="month"
                            defaultDate={new Date()}
                        />
                        {selectedDate && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h3>Detail Jadwal pada {selectedDate}</h3>
                                    {bookedSlots.length > 0 && (
                                        <>
                                            <h4>Slot yang Sudah Dipesan:</h4>
                                            <ul>
                                                {bookedSlots.map((slot, index) => (
                                                    <li key={index} className="booked-slot">
                                                        {slot.time}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {availableSlots.length > 0 ? (
                                        <>
                                            <h4>Slot yang Tersedia:</h4>
                                            <ul>
                                                {availableSlots.map((slot, index) => (
                                                    <li key={index} className="available-slot">
                                                        {slot}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        bookedSlots.length === 0 && (
                                            <p className="text-gray-600">Tidak ada slot tersedia.</p>
                                        )
                                    )}
                                    <button onClick={() => setSelectedDate(null)}>
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'form' && (
                    <div className="content-section form-section">
                        <h2>Formulir Konseling</h2>
                        <p className="subheader">
                            Silakan isi formulir berikut untuk memesan sesi konseling. Anda dapat memesan mulai 1 hari ke depan pada jam 08:00-11:00 dan 13:00-16:00 (kecuali hari Minggu).
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
                                                noWhatsApp: formData.noWhatsApp,
                                                bookingDate: formData.bookingDate,
                                                bookingTime: formData.bookingTime,
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
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="issue">Masalah yang Ingin Dibahas</label>
                                    <textarea
                                        id="issue"
                                        name="issue"
                                        value={formData.issue}
                                        onChange={handleChange}
                                        placeholder="Jelaskan masalah yang ingin Anda bahas..."
                                        required
                                    />
                                    {(errors.issue || serverErrors?.issue) && (
                                        <span className="error">{errors.issue || serverErrors.issue}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookingDate">Tanggal Booking</label>
                                    <input
                                        type="date"
                                        id="bookingDate"
                                        name="bookingDate"
                                        value={formData.bookingDate}
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            if (selectedDate.getDay() === 0) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    bookingDate: 'Tidak dapat melakukan booking pada hari Minggu.',
                                                }));
                                            } else {
                                                handleChange(e);
                                            }
                                        }}
                                        min={minDate}
                                        required
                                    />
                                    {(errors.bookingDate || serverErrors?.bookingDate) && (
                                        <span className="error">{errors.bookingDate || serverErrors.bookingDate}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookingTime">Jam Booking</label>
                                    <select
                                        id="bookingTime"
                                        name="bookingTime"
                                        value={formData.bookingTime}
                                        onChange={handleChange}
                                        required
                                    >
                                        {availableTimes.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {(errors.bookingTime || serverErrors?.bookingTime) && (
                                        <span className="error">{errors.bookingTime || serverErrors.bookingTime}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="noWhatsApp">Nomor WhatsApp Anda</label>
                                    <div className="input-container">
                                        <img
                                            src="https://img.icons8.com/color/48/000000/whatsapp.png"
                                            alt="WhatsApp Icon"
                                        />
                                        <input
                                            type="text"
                                            id="noWhatsApp"
                                            name="noWhatsApp"
                                            value={formData.noWhatsApp}
                                            onChange={handleChange}
                                            placeholder="+6281234567890"
                                            required
                                        />
                                    </div>
                                    {(errors.noWhatsApp || serverErrors?.noWhatsApp) && (
                                        <span className="error">{errors.noWhatsApp || serverErrors.noWhatsApp}</span>
                                    )}
                                </div>
                                <div className="button-group">
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
                                    <button
                                        onClick={handleWhatsAppContact}
                                        disabled={!isFormSubmitted}
                                        className="whatsapp-button"
                                    >
                                        <img
                                            src="https://img.icons8.com/color/48/000000/whatsapp.png"
                                            width="20"
                                            height="20"
                                            alt="WhatsApp Icon"
                                        />
                                        Hubungi via WhatsApp
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
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

            {showError && (flash?.error || serverErrors?.general || serverErrors?.auth || errors?.bookingTime) && (
                <div className="error-toast">
                    <img
                        src="https://img.icons8.com/ios-filled/50/ffffff/error.png"
                        width="20"
                        height="20"
                        alt="Error Icon"
                    />
                    {flash?.error || serverErrors?.general || serverErrors?.auth || errors?.bookingTime || 'Gagal mengirim permintaan konseling. Silakan coba lagi.'}
                </div>
            )}

            <FooterLayout />
        </GuestLayout>
    );
}