import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/home.css';

const NavbarGuestLayoutPage = () => {
    const [layananDropdownOpen, setLayananDropdownOpen] = useState(false);
    const [organisasiDropdownOpen, setOrganisasiDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const layananDropdownRef = useRef(null);
    const organisasiDropdownRef = useRef(null);
    const { url } = usePage();

    const isActive = (path) => url === path;

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                layananDropdownRef.current &&
                !layananDropdownRef.current.contains(event.target)
            ) {
                setLayananDropdownOpen(false);
            }

            if (
                organisasiDropdownRef.current &&
                !organisasiDropdownRef.current.contains(event.target)
            ) {
                setOrganisasiDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [layananDropdownRef, organisasiDropdownRef]);

    // Add scroll event listener for navbar
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

    // Add smooth scroll behavior
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    const getPageTitle = () => {
        switch (url) {
            case '/':
                return 'Beranda';
            case '/newsguest':
                return 'Berita';
            case '/announcement':
                return 'Pengumuman';
            case '/struktur':
                return 'Struktur Organisasi';
            case '/kegiatan':
                return 'Kegiatan';
            case '/counseling':
                return 'Konseling';
            default:
                if (url.startsWith('/counseling')) return 'Konseling';
                if (url.startsWith('/beasiswa')) return 'Beasiswa';
                if (url.startsWith('/downloads')) return 'Unduhan';
                if (url.startsWith('/asrama')) return 'Asrama';
                if (url.startsWith('/bem')) return 'BEM';
                if (url.startsWith('/mpm')) return 'MPM';
                return 'Beranda';
        }
    };

    const getBreadcrumb = () => {
        const title = getPageTitle();
        const breadcrumbItems = [];
    
        // Selalu tambahkan "Beranda" sebagai item pertama yang dapat diklik
        breadcrumbItems.push(
            <Link key="beranda" href="/" className="text-white hover:text-blue-200 transition-colors">
                Beranda
            </Link>
        );
    
        if (url === '/') return breadcrumbItems;
    
        // Untuk halaman langsung di bawah root
        if (['/newsguest', '/announcement', '/struktur', '/kegiatan'].includes(url)) {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        } 
        // Untuk Layanan Kemahasiswaan
        else if (url.startsWith('/counseling') || url.startsWith('/beasiswa') || 
                 url.startsWith('/downloads') || url.startsWith('/asrama')) {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <span key="layanan" className="text-white">Layanan Kemahasiswaan</span>,
                <span key="separator-2" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        } 
        // Untuk Organisasi
        else if (url.startsWith('/bem') || url.startsWith('/mpm')) {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <span key="organisasi" className="text-white">Organisasi</span>,
                <span key="separator-2" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        } 
        // Default case
        else {
            breadcrumbItems.push(
                <span key="separator-1" className="mx-2">/</span>,
                <Link key={title} href={url} className="text-white hover:text-blue-200 transition-colors">
                    {title}
                </Link>
            );
        }
    
        return breadcrumbItems;
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                layananDropdownRef.current &&
                !layananDropdownRef.current.contains(event.target)
            ) {
                setLayananDropdownOpen(false);
            }

            if (
                organisasiDropdownRef.current &&
                !organisasiDropdownRef.current.contains(event.target)
            ) {
                setOrganisasiDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [layananDropdownRef, organisasiDropdownRef]);

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
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    // Single declaration of toggleMobileMenu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(prevState => !prevState);
    };

    return (
        <header>
        <nav className="navbar sticky top-0 z-50 shadow-xl">
            <div className="container mx-auto w-full">
                <div className="relative flex h-full items-center justify-between">
                    {/* Logo - Left aligned */}
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

                    {/* Menu items - Right aligned (Desktop) */}
                    <div className="hidden lg:flex lg:items-center">
                        <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                            <Link
                                href="/"
                                className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/') ? 'nav-item-active' : 'transition-colors hover:text-white'
                                    }`}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/newsguest"
                                className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/newsguest') ? 'nav-item-active' : 'transition-colors hover:text-white'
                                    }`}
                            >
                                Berita
                            </Link>
                            <Link
                                href="/announcement"
                                className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/announcementguest') ? 'nav-item-active' : 'transition-colors hover:text-white'
                                    }`}
                            >
                                Pengumuman
                            </Link>
                            <Link
                                href="/struktur"
                                className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/struktur') ? 'nav-item-active' : 'transition-colors hover:text-white'
                                    }`}
                            >
                                Struktur Organisasi
                            </Link>
                            <Link
                                href="/kegiatan"
                                className={`nav-item flex items-center px-2 md:px-3 font-medium text-white ${isActive('/kegiatan') ? 'nav-item-active' : 'transition-colors hover:text-white'
                                    }`}
                            >
                                Kegiatan
                            </Link>

                            {/* Layanan Kemahasiswaan Dropdown */}
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
                                            href="#"
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
                                        <Link
                                            href="#"
                                            className="dropdown-item block border-l-4 border-transparent px-4 py-3 text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={() => setLayananDropdownOpen(false)}
                                        >
                                            <div className="font-medium">Asrama</div>
                                            <div className="text-xs text-gray-500">
                                                Informasi dan pendaftaran asrama
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Organisasi Mega Dropdown */}
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
                                            {/* BEM Section */}
                                            <div className="w-1/2">
                                                <div className="mega-menu-title">
                                                    BEM (Badan Eksekutif Mahasiswa)
                                                </div>
                                                <div className="mt-2">
                                                    <Link href="#" className="mega-menu-item">
                                                        Profil BEM
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Struktur Organisasi
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Program Kerja
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Kalender Kegiatan
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Prestasi
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Galeri
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* MPM Section */}
                                            <div className="w-1/2">
                                                <div className="mega-menu-title">
                                                    MPM (Majelis Perwakilan Mahasiswa)
                                                </div>
                                                <div className="mt-2">
                                                    <Link href="#" className="mega-menu-item">
                                                        Tentang MPM
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Anggota MPM
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Komisi
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Produk Legislasi
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Rapat & Sidang
                                                    </Link>
                                                    <Link href="#" className="mega-menu-item">
                                                        Advokasi Mahasiswa
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
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

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mobile-menu bg-white shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                href="#"
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="#"
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Berita
                            </Link>
                            <Link
                                href="#announcements"
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pengumuman
                            </Link>
                            <Link
                                href="#structure"
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Struktur Organisasi
                            </Link>
                            <Link
                                href="#events"
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Kegiatan
                            </Link>

                            {/* Layanan Kemahasiswaan Mobile Dropdown */}
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
                                            href="#"
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
                                        <Link
                                            href="#"
                                            className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={() => {
                                                setLayananDropdownOpen(false);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Asrama
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Organisasi Mobile Dropdown */}
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
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Profil BEM
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Struktur Organisasi
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Program Kerja
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Kalender Kegiatan
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Prestasi
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Galeri
                                            </Link>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="text-sm font-semibold text-gray-700">MPM</div>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Tentang MPM
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Anggota MPM
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Komisi
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Produk Legislasi
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Rapat & Sidang
                                            </Link>
                                            <Link
                                                href="#"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => {
                                                    setOrganisasiDropdownOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Advokasi Mahasiswa
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

                {/* Header Image Section */}
            <div className="relative w-full h-[286px] overflow-hidden">
                            <img
                                src="/assets/images/del.jpg"
                                alt="Header Background"
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="text-center text-white px-4">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                                        {getPageTitle()}
                                    </h1>
                                    <p className="mt-2 text-lg md:text-xl drop-shadow-md flex flex-wrap justify-center gap-1">
                                        {getBreadcrumb()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>
                );
            };

export default NavbarGuestLayoutPage;