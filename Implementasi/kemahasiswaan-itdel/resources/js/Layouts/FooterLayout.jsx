import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import '../../css/footer.css'; // Ensure this points to the correct file

const FooterLayout = () => {
    // Load Font Awesome for social media icons
    useEffect(() => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
        document.head.appendChild(linkElement);

        return () => {
            document.head.removeChild(linkElement);
        };
    }, []);

    // Initialize WOW.js for animations
    useEffect(() => {
        if (typeof window !== 'undefined' && window.WOW) {
            new window.WOW().init();
        }
    }, []);

    return (
        <footer className="footer py-5 wow fadeIn" data-wow-delay="0.2s">
            <div className="container">
                <div className="row g-5 d-flex align-items-start justify-content-between">
                    {/* Logo & Description */}
                    <div className="col-lg-4 col-md-6 d-flex align-items-center">
                        <div className="footer-logo me-3">
                            <img
                                src="img/logofooter.png"
                                alt="Logo"
                                style={{ maxWidth: 160, height: 'auto' }}
                            />
                        </div>
                        <div
                            className="footer-divider"
                            style={{
                                borderLeft: '2px solid rgba(255,255,255,0.2)',
                                height: 150,
                                margin: '0 20px',
                            }}
                        />
                        <div>
                            <h4 className="footer-heading text-white mb-2">Kemahasiswaan IT Del</h4>
                            <p className="text-gray-300 m-0" style={{ fontSize: 15 }}>
                                Mengelola kegiatan dan kesejahteraan mahasiswa di bawah naungan
                                Wakil Rektor Bidang Akademik.
                            </p>
                        </div>
                    </div>

                    {/* Peta (Map) */}
                    <div className="col-lg-3 col-md-6">
                        <h4 className="footer-heading text-white mb-3">Peta</h4>
                        <hr
                            style={{
                                borderTop: '1px solid #fff',
                                opacity: '0.2',
                                margin: '10px 0',
                            }}
                        />
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2188.0349666325465!2d99.14719957306939!3d2.383147867320283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e00fdad2d7341%3A0xf59ef99c591fe451!2sDel%20Institute%20of%20Technology!5e0!3m2!1sen!2sid!4v1740194730081!5m2!1sen!2sid"
                            width="100%"
                            height={120}
                            style={{ border: 0, borderRadius: 10, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }}
                            allowFullScreen
                            loading="lazy"
                            title="Institut Teknologi Del Location"
                            className="footer-map"
                        />
                    </div>

                    {/* Alamat (Address) */}
                    <div className="col-lg-3 col-md-6">
                        <h4 className="footer-heading text-white mb-3">Alamat</h4>
                        <hr
                            style={{
                                borderTop: '1px solid #fff',
                                opacity: '0.2',
                                margin: '10px 0',
                            }}
                        />
                        <p className="text-gray-300 m-0" style={{ fontSize: 14 }}>
                            Jl. Sisingamangaraja, Sitoluama, Laguboti, Toba Samosir, Sumatera
                            Utara, Indonesia
                            <br />
                            Kode Pos: 22381
                        </p>
                    </div>

                    {/* Media Sosial (Social Media) */}
                    <div className="col-lg-2 col-md-6">
                        <h4 className="footer-heading text-white mb-3">Media Sosial</h4>
                        <hr
                            style={{
                                borderTop: '1px solid #fff',
                                opacity: '0.2',
                                margin: '10px 0',
                            }}
                        />
                        <div className="footer-btn d-flex">
                            <a
                                className="btn btn-md-square rounded-circle me-2"
                                href="#"
                                aria-label="Facebook"
                            >
                                <i className="fab fa-facebook-f" />
                            </a>
                            <a
                                className="btn btn-md-square rounded-circle me-2"
                                href="#"
                                aria-label="Twitter"
                            >
                                <i className="fab fa-twitter" />
                            </a>
                            <a
                                className="btn btn-md-square rounded-circle me-2"
                                href="#"
                                aria-label="Instagram"
                            >
                                <i className="fab fa-instagram" />
                            </a>
                            <a
                                className="btn btn-md-square rounded-circle"
                                href="#"
                                aria-label="LinkedIn"
                            >
                                <i className="fab fa-linkedin-in" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr
                    style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                        margin: '2rem 0',
                    }}
                />

                {/* Back to Top Button and Copyright */}
                <div className="text-center mt-4">
                    <a
                        href="#"
                        className="btn btn-primary rounded-circle back-to-top mb-3"
                        aria-label="Back to Top"
                    >
                        <i className="fas fa-arrow-up" />
                    </a>
                    <p className="text-gray-300 m-0" style={{ fontSize: 14 }}>
                        &copy; {new Date().getFullYear()} Institut Teknologi Del Kemahasiswaan. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterLayout;