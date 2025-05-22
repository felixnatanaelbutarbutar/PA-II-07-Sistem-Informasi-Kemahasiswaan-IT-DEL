import { useEffect, useRef, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import '../../css/home.css';
import { LogOut, ChevronDown } from 'lucide-react'; // Tambahkan ikon yang diperlukan

const Navbar = ({ showBreadcrumbAndHeader = true }) => {
    const [layananDropdownOpen, setLayananDropdownOpen] = useState(false);
    const [organisasiDropdownOpen, setOrganisasiDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const layananDropdownRef = useRef(null);
    const organisasiDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);
    const { url, props } = usePage(); // Ambil props untuk mengakses user
    const user = props.auth?.user; // Ambil data user dari auth

    const isActive = (path) => url === path;

    useEffect(() => {
        function handleClickOutside(event) {
            if (layananDropdownRef.current && !layananDropdownRef.current.contains(event.target)) {
                setLayananDropdownOpen(false);
            }
            if (organisasiDropdownRef.current && !organisasiDropdownRef.current.contains(event.target)) {
                setOrganisasiDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [layananDropdownRef, organisasiDropdownRef, userDropdownRef]);

    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 0) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => (document.documentElement.style.scrollBehavior = 'auto');
    }, []);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const handleNavigation = (path, sectionId) => {
        router.visit(path, {
            onSuccess: () => {
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            },
        });
        setOrganisasiDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    const getPageTitle = () => {
        switch (url) {
            case '/':
                return 'Beranda';
            case '/newsguest':
                return 'Berita';
            case '/announcement':
                return 'Pengumuman';
            case '/achievements':
                return 'Prestasi';
            case '/activities':
                return 'Kalender Kegiatan';
            case '/counseling':
                return 'Konseling';
            case '/aspiration':
                return 'Aspirasi';
            default:
                if (url.startsWith('/counseling')) return 'Konseling';
                if (url.startsWith('/scholarships')) return 'Beasiswa';
                if (url.startsWith('/downloads')) return 'Unduhan';
                if (url.startsWith('/bem')) return 'BEM';
                if (url.startsWith('/mpm')) return 'MPM';
                if (url.startsWith('/aspiration')) return 'Aspirasi';
                return 'Beranda';
        }
    };

    const getBreadcrumb = () => {
        if (!showBreadcrumbAndHeader) return null;

        const title = getPageTitle();
        const breadcrumbItems = [
            <Link key="beranda" href="/" className="text-white hover:text-blue-200 transition-colors">
                Beranda
            </Link>,
        ];

        if (url === '/') return breadcrumbItems;

        if (['/newsguest', '/announcement', '/achievements', '/activities'].includes(url)) {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        } else if (url.startsWith('/counseling') || url.startsWith('/scholarships') ||
            url.startsWith('/downloads')) {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <span key="layanan" className="text-white">Layanan Kemahasiswaan</span>,
                <span key="separator-2" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        } else if (url.startsWith('/bem') || url.startsWith('/mpm')) {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <span key="organisasi" className="text-white">Organisasi</span>,
                <span key="separator-2" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        } else {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        }

        return breadcrumbItems;
    };

    return (
        <header>
            <nav className="navbar sticky top-0 z-50 shadow-xl">
                <div className="container mx-auto w-full">
                    <div className="relative flex h-full items-center justify-between">
                        <div className="logo-container flex items-center pl-0">
                            <img
                                src="/assets/images/logo/logo-removebg.png"
                                alt="Logo"
                                className="logo-image w-auto drop-shadow-md"
                            />
                            <div className="logo-divider ml-2"></div>
                            <div className="flex flex-col">
                                <span className="logo-text-secondary font-bold tracking-wider text-white drop-shadow-sm">
                                    Institut Teknologi Del
                                </span>
                                <span className="logo-text-primary text-gray-100">
                                    Kemahasiswaan
                                </span>
                            </div>
                        </div>

                        <div className="hidden lg:flex lg:items-center">
                            <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                                <Link
                                    href="/"
                                    className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/') ? 'nav-item-active' : 'transition-colors hover:text-white'}`}
                                >
                                    Beranda
                                </Link>
                                <Link
                                    href="/newsguest"
                                    className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/newsguest') ? 'nav-item-active' : 'transition-colors hover:text-white'}`}
                                >
                                    Berita
                                </Link>
                                <Link
                                    href="/announcement"
                                    className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/announcement') ? 'nav-item-active' : 'transition-colors hover:text-white'}`}
                                >
                                    Pengumuman
                                </Link>
                                <Link
                                    href="/achievements"
                                    className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/achievements') ? 'nav-item-active' : 'transition-colors hover:text-white'}`}
                                >
                                    Prestasi
                                </Link>
                                <Link
                                    href="/activities"
                                    className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/activities') ? 'nav-item-active' : 'transition-colors hover:text-white'}`}
                                >
                                    Kalender Kegiatan
                                </Link>

                                <div className="relative" ref={layananDropdownRef}>
                                    <button
                                        onClick={() => setLayananDropdownOpen(!layananDropdownOpen)}
                                        className="nav-item flex items-center px-2 md:px-3 font-medium text-white transition-colors hover:text-white"
                                    >
                                        <span>Layanan Kemahasiswaan</span>
                                        <svg
                                            className={`ml-1 h-4 w-4 transition-transform duration-300 ${layananDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {layananDropdownOpen && (
                                        <div className="dropdown-menu absolute right-0 mt-1 w-60 overflow-hidden rounded-lg bg-white/95 py-1 shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm">
                                            <Link
                                                href="/scholarships"
                                                className="dropdown-item block border-l-4 border-transparent px-4 py-3 text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => setLayananDropdownOpen(false)}
                                            >
                                                <div className="font-medium">Beasiswa</div>
                                                <div className="text-xs text-gray-500">
                                                    Informasi dan pendaftaran beasiswa
                                                </div>
                                            </Link>
                                            <Link
                                                href="/counseling"
                                                className="dropdown-item block border-l-4 border-transparent px-4 py-3 text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => setLayananDropdownOpen(false)}
                                            >
                                                <div className="font-medium">Konseling</div>
                                                <div className="text-xs text-gray-500">
                                                    Layanan konseling untuk mahasiswa
                                                </div>
                                            </Link>
                                            <Link
                                                href="/downloads"
                                                className="dropdown-item block border-l-4 border-transparent px-4 py-3 text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => setLayananDropdownOpen(false)}
                                            >
                                                <div className="font-medium">Unduhan</div>
                                                <div className="text-xs text-gray-500">
                                                    katakata
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <div className="relative" ref={organisasiDropdownRef}>
                                    <button
                                        onClick={() => setOrganisasiDropdownOpen(!organisasiDropdownOpen)}
                                        className="nav-item flex items-center px-2 md:px-3 font-medium text-white transition-colors hover:text-white"
                                    >
                                        <span>Organisasi</span>
                                        <svg
                                            className={`ml-1 h-4 w-4 transition-transform duration-300 ${organisasiDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {organisasiDropdownOpen && (
                                        <div className="mega-dropdown absolute right-0 mt-1 overflow-hidden rounded-lg bg-white/95 p-6 shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm">
                                            <div className="flex gap-8">
                                                <div className="w-1/2">
                                                    <div className="mega-menu-title">
                                                        BEM (Badan Eksekutif Mahasiswa)
                                                    </div>
                                                    <div className="mt-2">
                                                        <Link
                                                            href="/bem#profil-bem"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/bem#profil-bem', 'profil-bem')}
                                                        >
                                                            Profil BEM
                                                        </Link>
                                                        <Link
                                                            href="/bem#visi-misi"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/bem#visi-misi', 'visi-misi')}
                                                        >
                                                            Visi & Misi
                                                        </Link>
                                                        <Link
                                                            href="/bem#struktur-organisasi"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/bem#struktur-organisasi', 'struktur-organisasi')}
                                                        >
                                                            Struktur Organisasi
                                                        </Link>
                                                        <Link
                                                            href="/bem#program-kerja"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/bem#program-kerja', 'program-kerja')}
                                                        >
                                                            Program Kerja
                                                        </Link>
                                                        <Link
                                                            href="/bem#partisipasi-anda"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/bem#partisipasi-anda', 'partisipasi-anda')}
                                                        >
                                                            Partisipasi Anda
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="w-1/2">
                                                    <div className="mega-menu-title">
                                                        MPM (Majelis Perwakilan Mahasiswa)
                                                    </div>
                                                    <div className="mt-2">
                                                        <Link
                                                            href="/mpm"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => {
                                                                setOrganisasiDropdownOpen(false);
                                                                setMobileMenuOpen(false);
                                                            }}
                                                        >
                                                            Tentang MPM
                                                        </Link>
                                                        <Link
                                                            href="/mpm#struktur-komisi"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/mpm#struktur-komisi', 'struktur-komisi')}
                                                        >
                                                            Struktur Komisi
                                                        </Link>
                                                        <Link
                                                            href="/mpm#partisipasi-anda"
                                                            className="mega-menu-item block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() => handleNavigation('/mpm#partisipasi-anda', 'partisipasi-anda')}
                                                        >
                                                            Partisipasi Anda
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Login atau Nama Pengguna */}
                                <div className="relative" ref={userDropdownRef}>
                                    {user ? (
                                        <button
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="nav-item flex items-center px-2 md:px-3 font-medium text-white transition-colors hover:text-white"
                                        >
                                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-sm mr-2">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="hidden md:inline">{user.name}</span>
                                            <ChevronDown
                                                className={`ml-1 h-4 w-4 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('login')}
                                            className="nav-item flex items-center px-2 md:px-3 font-medium text-white transition-colors hover:text-white"
                                        >
                                            Login
                                        </Link>
                                    )}

                                    {user && userDropdownOpen && (
                                        <div className="dropdown-menu absolute right-0 mt-1 w-48 overflow-hidden rounded-lg bg-white/95 py-1 shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm">
                                            <div className="p-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                className="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center lg:hidden">
                            <button
                                type="button"
                                className="mobile-menu-button inline-flex items-center justify-center rounded-full p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                aria-controls="mobile-menu"
                                aria-expanded={mobileMenuOpen}
                                onClick={toggleMobileMenu}
                            >
                                <span className="sr-only">Open main menu</span>
                                {mobileMenuOpen ? (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="lg:hidden mobile-menu bg-white shadow-lg">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <Link
                                    href="/"
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Beranda
                                </Link>
                                <Link
                                    href="/newsguest"
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Berita
                                </Link>
                                <Link
                                    href="/announcement"
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pengumuman
                                </Link>
                                <Link
                                    href="/achievements"
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Prestasi
                                </Link>
                                <Link
                                    href="/activities"
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Kegiatan
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setLayananDropdownOpen(!layananDropdownOpen)}
                                        className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                                    >
                                        <span>Layanan Kemahasiswaan</span>
                                        <svg
                                            className={`h-5 w-5 transition-transform duration-300 ${layananDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {layananDropdownOpen && (
                                        <div className="pl-4 space-y-1">
                                            <Link
                                                href="/scholarships"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setLayananDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Beasiswa
                                            </Link>
                                            <Link
                                                href="/counseling"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setLayananDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Konseling
                                            </Link>
                                            <Link
                                                href="/downloads"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setLayananDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Unduhan
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setOrganisasiDropdownOpen(!organisasiDropdownOpen)}
                                        className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                                    >
                                        <span>Organisasi</span>
                                        <svg
                                            className={`h-5 w-5 transition-transform duration-300 ${organisasiDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {organisasiDropdownOpen && (
                                        <div className="pl-4 space-y-1">
                                            <div className="border-t pt-2">
                                                <div className="text-sm font-semibold text-gray-700">BEM</div>
                                                <Link
                                                    href="/bem#profil-bem"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/bem#profil-bem', 'profil-bem')}
                                                >
                                                    Profil BEM
                                                </Link>
                                                <Link
                                                    href="/bem#visi-misi"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/bem#visi-misi', 'visi-misi')}
                                                >
                                                    Visi & Misi
                                                </Link>
                                                <Link
                                                    href="/bem#struktur-organisasi"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/bem#struktur-organisasi', 'struktur-organisasi')}
                                                >
                                                    Struktur Organisasi
                                                </Link>
                                                <Link
                                                    href="/bem#program-kerja"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/bem#program-kerja', 'program-kerja')}
                                                >
                                                    Program Kerja
                                                </Link>
                                                <Link
                                                    href="/bem#partisipasi-anda"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/bem#partisipasi-anda', 'partisipasi-anda')}
                                                >
                                                    Partisipasi Anda
                                                </Link>
                                            </div>

                                            <div className="border-t pt-2">
                                                <div className="text-sm font-semibold text-gray-700">MPM</div>
                                                <Link
                                                    href="/mpm"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => {
                                                        setOrganisasiDropdownOpen(false);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Tentang MPM
                                                </Link>
                                                <Link
                                                    href="/mpm#struktur-komisi"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/mpm#struktur-komisi', 'struktur-komisi')}
                                                >
                                                    Struktur Komisi
                                                </Link>
                                                <Link
                                                    href="/mpm#partisipasi-anda"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleNavigation('/mpm#partisipasi-anda', 'partisipasi-anda')}
                                                >
                                                    Partisipasi Anda
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Login atau Nama Pengguna di Mobile Menu */}
                                {user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                                        >
                                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-sm mr-2">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span>{user.name}</span>
                                            <ChevronDown
                                                className={`h-5 w-5 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {userDropdownOpen && (
                                            <div className="pl-4 space-y-1">
                                                <div className="p-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center"
                                                    onClick={() => {
                                                        setUserDropdownOpen(false);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Logout
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {showBreadcrumbAndHeader && (
                <div className="relative w-full h-[350px] overflow-hidden">
                    <img
                        src="/assets/images/audit.svg"
                        alt="Header Background"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                                {getPageTitle()}
                            </h1>
                            <p className="mt-2 text-lg md:text-xl drop-shadow-md flex flex-wrap justify-center gap-1">
                                {getBreadcrumb()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;