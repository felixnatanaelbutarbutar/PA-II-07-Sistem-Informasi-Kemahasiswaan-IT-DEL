import { Link } from '@inertiajs/react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from 'react-icons/fa';

const FooterLayout = () => {
    // Smooth scroll to top functionality
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="flex flex-col items-start">
                        <div className="mb-4">
                            <img
                                src="/assets/images/logo/logo-removebg.png"
                                alt="Logo"
                                className="h-12 w-auto"
                            />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Kemahasiswaan IT Del</h4>
                        <p className="text-sm text-gray-300">
                            Mengelola kegiatan dan kesejahteraan mahasiswa di bawah naungan Wakil Rektor Bidang Akademik.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/news" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Berita
                                </Link>
                            </li>
                            <li>
                                <Link href="/announcement" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Pengumuman
                                </Link>
                            </li>

                            <li>
                                <Link href="/achievements" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Prestasi
                                </Link>
                            </li>
                            <li>
                                <Link href="/scholarships" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Beasiswa
                                </Link>
                            </li>
                            <li>
                                <Link href="/counseling" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Konseling
                                </Link>
                            </li>
                            <li>
                                <Link href="/downloads" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Unduhan
                                </Link>
                            </li>
                            <li>
                                <Link href="/bem" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Badan Eksekutif Mahasiswa
                                </Link>
                            </li>
                            <li>
                                <Link href="/downloads" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                                    Majelis Perwakilan Mahasiswa
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Map */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Kontak Kami</h4>
                        <p className="text-sm text-gray-300 mb-2">
                            Jl. Sisingamangaraja, Sitoluama, Laguboti, Toba Samosir, Sumatera Utara, Indonesia
                            <br />
                            Kode Pos: 22381
                        </p>
                        <p className="text-sm text-gray-300 mb-2">
                            <span className="font-semibold">Email:</span> kemahasiswaan@del.ac.id
                        </p>
                        <p className="text-sm text-gray-300 mb-4">
                            <span className="font-semibold">Telepon:</span> +62 123 456 7890
                        </p>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2188.0349666325465!2d99.14719957306939!3d2.383147867320283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e00fdad2d7341%3A0xf59ef99c591fe451!2sDel%20Institute%20of%20Technology!5e0!3m2!1sen!2sid!4v1740194730081!5m2!1sen!2sid"
                            width="100%"
                            height="120"
                            className="rounded-lg shadow-lg"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            title="Institut Teknologi Del Location"
                        />
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Media Sosial</h4>
                        <div className="flex space-x-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition duration-200"
                                aria-label="Facebook"
                            >
                                <FaFacebookF size={16} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-blue-400 rounded-full hover:bg-blue-500 transition duration-200"
                                aria-label="Twitter"
                            >
                                <FaTwitter size={16} />
                            </a>
                            <a
                            href="https://www.instagram.com/kemahasiswaanitdel?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                            target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-pink-600 rounded-full hover:bg-pink-700 transition duration-200"
                                aria-label="Instagram"
                            >
                                <FaInstagram size={16} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-blue-800 rounded-full hover:bg-blue-900 transition duration-200"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedinIn size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-8 border-t border-blue-800" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-300 mb-4 md:mb-0">
                        © {new Date().getFullYear()} Institut Teknologi Del Kemahasiswaan. All Rights Reserved.
                    </p>
                    <div className="flex space-x-4">
                        <Link href="/privacy" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm text-gray-300 hover:text-blue-300 transition duration-200">
                            Terms of Service
                        </Link>
                    </div>
                </div>

                {/* Back to Top Button */}
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
                    aria-label="Back to Top"
                >
                    <FaArrowUp size={16} />
                </button>
            </div>
        </footer>
    );
};

export default FooterLayout;
