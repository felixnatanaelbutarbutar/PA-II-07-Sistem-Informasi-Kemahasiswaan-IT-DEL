import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    LayoutDashboard,
    Bell,
    Settings,
    Calendar,
    Users,
    Newspaper,
    Award,
    Heart,
    BookOpen,
    Download,
    MessageSquare,
    Image as LucideImage,
    TrendingUp, // Tambahkan impor untuk TrendingUp
    Activity, // Tambahkan impor untuk Activity
} from 'lucide-react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard({ auth, userRole, permissions, menu, totalMahasiswa }) {
    const [activeActivities, setActiveActivities] = useState(0);
    const [announcementsCount, setAnnouncementsCount] = useState(0);
    const [aspirationData, setAspirationData] = useState([]);
    const [aspirationError, setAspirationError] = useState(null);
    const [aspirationLoading, setAspirationLoading] = useState(false);
    const [achievementData, setAchievementData] = useState({
        International: { Gold: 0, Silver: 0, Bronze: 0 },
        National: { Gold: 0, Silver: 0, Bronze: 0 },
        Regional: { Gold: 0, Silver: 0, Bronze: 0 },
    });
    const [achievementError, setAchievementError] = useState(null);

    // Icon mapping dari RoleHelper ke lucide-react
    const iconMap = {
        home: LayoutDashboard,
        bell: Bell,
        gear: Settings,
        calendar: Calendar,
        organization: Users,
        newspaper: Newspaper,
        award: Award,
        heart: Heart,
        scholarship: BookOpen,
        download: Download,
        aspiration: MessageSquare,
        carousel: LucideImage,
    };

    useEffect(() => {
        // console.log('User info:', auth.user);
        // console.log('User role:', userRole);

        // Fetch jumlah kegiatan aktif
        axios.get('https://kemahasiswaanitdel.site/admin/activities/count')
            .then(response => {
                setActiveActivities(response.data.active_count);
            })
            .catch(error => {
                console.error('Error fetching active activities count:', error);
            });

        // Fetch jumlah pengumuman
        axios.get('https://kemahasiswaanitdel.site/admin/announcements/count')
            .then(response => {
                setAnnouncementsCount(response.data.count);
            })
            .catch(error => {
                console.error('Error fetching announcements count:', error);
            });

        // Fetch aspiration data (for kemahasiswaan and adminmpm roles)
        if (['kemahasiswaan', 'adminmpm'].includes(userRole)) {
            setAspirationLoading(true);
            axios.get('https://kemahasiswaanitdel.site/api/aspiration-categories')
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setAspirationData(response.data);
                    } else {
                        throw new Error('Data aspirasi tidak sesuai format yang diharapkan.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching aspiration data:', error);
                    setAspirationError('Gagal memuat data aspirasi. Silakan coba lagi nanti.');
                })
                .finally(() => {
                    setAspirationLoading(false);
                });
        }

        // Fetch achievement data (for kemahasiswaan role only)
        if (userRole === 'kemahasiswaan') {
            axios.get('https://kemahasiswaanitdel.site/api/achievements-grouped')
                .then(response => {
                    if (response.data && typeof response.data === 'object') {
                        setAchievementData(response.data);
                    } else {
                        throw new Error('Data prestasi tidak sesuai format yang diharapkan.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching achievement data:', error);
                    setAchievementError('Gagal memuat data prestasi. Silakan coba lagi nanti.');
                });
        }
    }, [auth.user, userRole]);

    // Fungsi untuk memeriksa apakah rute valid
    const isRouteValid = (routeName) => {
        if (!routeName) {
            console.warn('Route name is undefined or null');
            return false;
        }
        try {
            const routeUrl = route(routeName);
            if (!routeUrl) {
                console.warn(`Route URL is undefined for route name: ${routeName}`);
                return false;
            }
            // console.log(`Route ${routeName} is valid with URL: ${routeUrl}`);
            return true;
        } catch (e) {
            console.error(`Error checking route for ${routeName}:`, e);
            return false;
        }
    };

    // Fungsi untuk mendapatkan route yang dapat digunakan untuk link
    const getLinkRoute = (item) => {
        if (item.route && isRouteValid(item.route)) {
            return item.route;
        }
        if (item.submenu && item.submenu.length > 0) {
            const validSubItem = item.submenu.find(subItem => subItem.route && isRouteValid(subItem.route));
            return validSubItem ? validSubItem.route : null;
        }
        return null;
    };

    // Daftar warna untuk setiap fitur
    const featureColors = [
        { bg: 'bg-blue-50', hoverBg: 'bg-blue-100', text: 'text-blue-800', accent: 'bg-blue-500', hoverText: 'text-blue-600' },
        { bg: 'bg-green-50', hoverBg: 'bg-green-100', text: 'text-green-800', accent: 'bg-green-500', hoverText: 'text-green-600' },
        { bg: 'bg-purple-50', hoverBg: 'bg-purple-100', text: 'text-purple-800', accent: 'bg-purple-500', hoverText: 'text-purple-600' },
        { bg: 'bg-yellow-50', hoverBg: 'bg-yellow-100', text: 'text-yellow-800', accent: 'bg-yellow-500', hoverText: 'text-yellow-600' },
        { bg: 'bg-red-50', hoverBg: 'bg-red-100', text: 'text-red-800', accent: 'bg-red-500', hoverText: 'text-red-600' },
        { bg: 'bg-indigo-50', hoverBg: 'bg-indigo-100', text: 'text-indigo-800', accent: 'bg-indigo-500', hoverText: 'text-indigo-600' },
    ];

    // Prepare data for the aspiration bar chart
    const aspirationChartData = {
        labels: aspirationData.map(category => category.name),
        datasets: [
            {
                label: 'Jumlah Aspirasi',
                data: aspirationData.map(category => category.aspirations?.length || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const aspirationChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Statistik Jumlah Aspirasi per Kategori',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Jumlah Aspirasi',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Kategori',
                },
            },
        },
    };

    // Prepare data for the achievement bar chart
    const achievementChartData = {
        labels: ['International', 'National', 'Regional'],
        datasets: [
            {
                label: 'Gold',
                data: [
                    achievementData['International']['Gold'],
                    achievementData['National']['Gold'],
                    achievementData['Regional']['Gold'],
                ],
                backgroundColor: 'rgba(255, 215, 0, 0.6)', // Gold color
                borderColor: 'rgba(255, 215, 0, 1)',
                borderWidth: 1,
            },
            {
                label: 'Silver',
                data: [
                    achievementData['International']['Silver'],
                    achievementData['National']['Silver'],
                    achievementData['Regional']['Silver'],
                ],
                backgroundColor: 'rgba(192, 192, 192, 0.6)', // Silver color
                borderColor: 'rgba(192, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Bronze',
                data: [
                    achievementData['International']['Bronze'],
                    achievementData['National']['Bronze'],
                    achievementData['Regional']['Bronze'],
                ],
                backgroundColor: 'rgba(205, 127, 50, 0.6)', // Bronze color
                borderColor: 'rgba(205, 127, 50, 1)',
                borderWidth: 1,
            },
        ],
    };

    const achievementChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Statistik Prestasi Mahasiswa',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Jumlah Medali',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Tingkat',
                },
            },
        },
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Admin Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header dengan Glass Effect */}
                    <div className={`backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border
                        ${document.documentElement.classList.contains('light') ? 'bg-white/80 border-gray-200/50' : ''}
                        ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800/80 border-zinc-700/50' : ''}
                        ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50/80 border-blue-200/50' : ''}
                        ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950/80 border-blue-800/50' : ''}`}>
                        <h1 className={`text-3xl font-bold bg-clip-text text-transparent
                            ${document.documentElement.classList.contains('light') ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-gradient-to-r from-blue-300 to-indigo-400' : ''}`}>
                            Selamat Datang, {auth.user.name || 'User'}
                        </h1>
                        <p className={`mt-1
                            ${document.documentElement.classList.contains('light') ? 'text-gray-500' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                            Kelola semua aktivitas kemahasiswaan di sini
                        </p>
                    </div>

                    {/* Statistik */}
                    {/* <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className={`group rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                            ${document.documentElement.classList.contains('light') ? 'bg-blue-50 hover:bg-blue-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-blue-900/30 hover:bg-blue-900/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100 hover:bg-blue-200' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 hover:bg-blue-700' : ''}`}>
                            <h3 className={`mb-2 text-lg font-medium
                                ${document.documentElement.classList.contains('light') ? 'text-blue-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-blue-300' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-900' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                Total Mahasiswa
                            </h3>
                            <p className={`text-3xl font-bold
                                ${document.documentElement.classList.contains('light') ? 'text-blue-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-blue-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                {totalMahasiswa}
                            </p>
                        </div>

                        <div className={`group rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                            ${document.documentElement.classList.contains('light') ? 'bg-green-50 hover:bg-green-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-green-900/30 hover:bg-green-900/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-green-100 hover:bg-green-200' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-green-800 hover:bg-green-700' : ''}`}>
                            <h3 className={`mb-2 text-lg font-medium
                                ${document.documentElement.classList.contains('light') ? 'text-green-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-green-300' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-green-900' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-green-200' : ''}`}>
                                Kegiatan Aktif
                            </h3>
                            <p className={`text-3xl font-bold
                                ${document.documentElement.classList.contains('light') ? 'text-green-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-green-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-green-700' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-green-100' : ''}`}>
                                {activeActivities}
                            </p>
                        </div>

                        <div className={`group rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                            ${document.documentElement.classList.contains('light') ? 'bg-purple-50 hover:bg-purple-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-purple-900/30 hover:bg-purple-900/50' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-purple-100 hover:bg-purple-200' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-purple-800 hover:bg-purple-700' : ''}`}>
                            <h3 className={`mb-2 text-lg font-medium
                                ${document.documentElement.classList.contains('light') ? 'text-purple-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-purple-300' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-purple-900' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-purple-200' : ''}`}>
                                Pengumuman
                            </h3>
                            <p className={`text-3xl font-bold
                                ${document.documentElement.classList.contains('light') ? 'text-purple-600' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-purple-400' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-purple-700' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-purple-100' : ''}`}>
                                {announcementsCount}
                            </p>
                        </div>
                    </div> */}

                    {/* Statistik - 2 Column Layout */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* First Card - Combining Total Mahasiswa and Kegiatan Aktif */}
                        <div className={`rounded-xl p-5 shadow-md transition-all hover:shadow-lg border
                            ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-100' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-900' : ''}`}>
                            <h3 className={`mb-3 text-lg font-medium flex items-center
                                ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                <Users className="mr-2 h-5 w-5" />
                                Informasi Mahasiswa
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`flex items-center mb-2
                                        ${document.documentElement.classList.contains('light') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-300' : ''}`}>
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        <p className="text-sm font-medium">Total Mahasiswa Pengguna Sistem</p>
                                    </div>
                                    <p className={`text-2xl font-bold
                                        ${document.documentElement.classList.contains('light') ? 'text-blue-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-blue-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                        {totalMahasiswa}
                                    </p>
                                </div>
                                <div>
                                    <div className={`flex items-center mb-2
                                        ${document.documentElement.classList.contains('light') ? 'text-green-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-green-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-green-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-green-300' : ''}`}>
                                        <Activity className="mr-2 h-4 w-4" />
                                        <p className="text-sm font-medium">Kegiatan Aktif</p>
                                    </div>
                                    <p className={`text-2xl font-bold
                                        ${document.documentElement.classList.contains('light') ? 'text-green-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-green-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-green-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-green-100' : ''}`}>
                                        {activeActivities}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Second Card - Announcements and quick access */}
                        <div className={`rounded-xl p-5 shadow-md transition-all hover:shadow-lg border
                            ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-100' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-100' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-900' : ''}`}>
                            <h3 className={`mb-3 text-lg font-medium flex items-center
                                ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                <Bell className="mr-2 h-5 w-5" />
                                Informasi Pengumuman
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`flex items-center mb-2
                                        ${document.documentElement.classList.contains('light') ? 'text-purple-700' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-purple-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-purple-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-purple-300' : ''}`}>
                                        <Newspaper className="mr-2 h-4 w-4" />
                                        <p className="text-sm font-medium">Total Pengumuman</p>
                                    </div>
                                    <p className={`text-2xl font-bold
                                        ${document.documentElement.classList.contains('light') ? 'text-purple-600' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-purple-400' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-purple-700' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-purple-100' : ''}`}>
                                        {announcementsCount}
                                    </p>
                                </div>
                                <div>
                                    <Link
                                        // href={route('admin.announcements.index')}
                                        href='https://kemahasiswaanitdel.site/admin/announcement'
                                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all
                                            ${document.documentElement.classList.contains('light') ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/50' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'bg-purple-800 text-purple-100 hover:bg-purple-700' : ''}`}>
                                        <Bell className="mr-1 h-4 w-4" />
                                        Kelola Pengumuman
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts area - Two column layout */}
                    {(['kemahasiswaan', 'adminmpm'].includes(userRole) || userRole === 'kemahasiswaan') && (
                        <div className="mb-6 grid gap-4 md:grid-cols-2">
                            {/* Aspiration Chart (Visible to kemahasiswaan and adminmpm) */}
                            {['kemahasiswaan', 'adminmpm'].includes(userRole) && (
                                <div className={`rounded-xl shadow-md p-5 border
                                    ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-100' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-100' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-900' : ''}`}>
                                    <h2 className={`text-lg font-medium mb-4 flex items-center
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Statistik Aspirasi
                                    </h2>
                                    {aspirationLoading ? (
                                        <div className="flex justify-center items-center h-56">
                                            <svg
                                                className="animate-spin h-8 w-8 text-blue-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                        </div>
                                    ) : aspirationError ? (
                                        <p className={`text-center text-red-500 h-56 flex items-center justify-center`}>
                                            {aspirationError}
                                        </p>
                                    ) : aspirationData.length > 0 ? (
                                        <div className="h-56">
                                            <Bar data={aspirationChartData} options={aspirationChartOptions} />
                                        </div>
                                    ) : (
                                        <p className={`text-center h-56 flex items-center justify-center
                                            ${document.documentElement.classList.contains('light') ? 'text-gray-500' : ''}
                                            ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                            Tidak ada data aspirasi untuk ditampilkan.
                                        </p>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <Link
                                            href="/admin/aspirations"
                                            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all
                                                ${document.documentElement.classList.contains('light') ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                ${document.documentElement.classList.contains('dark') ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/50' : ''}
                                                ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-800 text-blue-100 hover:bg-blue-700' : ''}`}>
                                            <MessageSquare className="mr-1 h-4 w-4" />
                                            Kelola Aspirasi
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Achievement Chart (Visible to kemahasiswaan only) */}
                            {userRole === 'kemahasiswaan' && (
                                <div className={`rounded-xl shadow-md p-5 border
                                    ${document.documentElement.classList.contains('light') ? 'bg-white border-gray-100' : ''}
                                    ${document.documentElement.classList.contains('dark') ? 'bg-zinc-800 border-zinc-700' : ''}
                                    ${document.documentElement.classList.contains('light-blue') ? 'bg-blue-50 border-blue-100' : ''}
                                    ${document.documentElement.classList.contains('dark-blue') ? 'bg-blue-950 border-blue-900' : ''}`}>
                                    <h2 className={`text-lg font-medium mb-4 flex items-center
                                        ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                                        ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                                        ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                                        ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                                        <Award className="mr-2 h-5 w-5" />
                                        Statistik Prestasi
                                    </h2>
                                    {achievementError ? (
                                        <p className={`text-center text-red-500 h-56 flex items-center justify-center`}>
                                            {achievementError}
                                        </p>
                                    ) : (
                                        <div className="h-56">
                                            <Bar data={achievementChartData} options={achievementChartOptions} />
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <Link
                                            href="/admin/achievements"
                                            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all
                                                ${document.documentElement.classList.contains('light') ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                                                ${document.documentElement.classList.contains('dark') ? 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-800/50' : ''}
                                                ${document.documentElement.classList.contains('light-blue') ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                                                ${document.documentElement.classList.contains('dark-blue') ? 'bg-yellow-800 text-yellow-100 hover:bg-yellow-700' : ''}`}>
                                            <Award className="mr-1 h-4 w-4" />
                                            Kelola Prestasi
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fitur yang Tersedia */}
                    <div className="mt-10">
                        <h2 className={`mb-4 text-xl font-semibold
                            ${document.documentElement.classList.contains('light') ? 'text-gray-800' : ''}
                            ${document.documentElement.classList.contains('dark') ? 'text-gray-200' : ''}
                            ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800' : ''}
                            ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100' : ''}`}>
                            Fitur yang Tersedia:
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {menu
                                .filter((item) => item.name !== 'Dashboard')
                                .map((item, index) => {
                                    const linkRoute = getLinkRoute(item);
                                    if (!linkRoute) {
                                        console.warn(`Skipping menu item "${item.name}" in Dashboard due to invalid or missing route.`);
                                        return null;
                                    }

                                    const color = featureColors[index % featureColors.length];

                                    return (
                                        <Link
                                            key={index}
                                            href={route(linkRoute)}
                                            className={`group flex items-center rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border
                                                ${document.documentElement.classList.contains('light') ? `${color.bg} hover:${color.hoverBg} border-gray-200/50` : ''}
                                                ${document.documentElement.classList.contains('dark') ? `bg-opacity-30 hover:bg-opacity-50 border-zinc-700/50 ${color.bg.replace('50', '900')}` : ''}
                                                ${document.documentElement.classList.contains('light-blue') ? `bg-blue-50 hover:bg-blue-100 border-blue-200/50` : ''}
                                                ${document.documentElement.classList.contains('dark-blue') ? `bg-blue-800 hover:bg-blue-700 border-blue-800/50` : ''}`}>
                                            <div className={`mr-4 rounded-full p-3 text-white transition-all duration-300 ${color.accent} group-hover:scale-110`}>
                                                {item.icon && iconMap[item.icon] ? (
                                                    React.createElement(iconMap[item.icon], {
                                                        className: 'h-6 w-6',
                                                    })
                                                ) : (
                                                    <LayoutDashboard className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-medium transition-colors duration-300
                                                    ${document.documentElement.classList.contains('light') ? `${color.text} group-hover:${color.hoverText}` : ''}
                                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-200 group-hover:text-blue-400' : ''}
                                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-800 group-hover:text-blue-600' : ''}
                                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-100 group-hover:text-blue-300' : ''}`}>
                                                    {item.name}
                                                </h3>
                                                <p className={`text-sm
                                                    ${document.documentElement.classList.contains('light') ? 'text-gray-600' : ''}
                                                    ${document.documentElement.classList.contains('dark') ? 'text-gray-400' : ''}
                                                    ${document.documentElement.classList.contains('light-blue') ? 'text-blue-600' : ''}
                                                    ${document.documentElement.classList.contains('dark-blue') ? 'text-blue-200' : ''}`}>
                                                    Kelola {item.name.toLowerCase()}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
