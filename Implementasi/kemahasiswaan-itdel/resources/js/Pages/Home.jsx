import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import "@fortawesome/fontawesome-free/css/all.min.css";

const App = () => {
    return (
        <>
            {/* Navbar Start */}
            <div className="container-fluid nav-bar px-0 px-lg-4 py-lg-0 bg-primary shadow-sm">
                <div className="container">
                    <nav className="navbar navbar-expand-lg navbar-dark bg-transparent">
                        <a href="#" className="navbar-brand p-0">
                            <img src="/assets/images/Kemahasiswaan.svg" alt="Logo" className="img-fluid" style={{ maxHeight: '40px' }} />
                        </a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                            <span className="fa fa-bars"></span>
                        </button>
                        <div className="collapse navbar-collapse justify-content-end" id="navbarCollapse">
                            <div className="d-flex align-items-center gap-3">
                                <a href="index.html" className="nav-item nav-link text-white fw-bold">Beranda</a>
                                <a href="about.html" className="nav-item nav-link text-white">Berita</a>
                                <a href="about.html" className="nav-item nav-link text-white">Pengumuman</a>
                                <div className="nav-item dropdown">
                                    <a href="#" className="nav-link dropdown-toggle text-white" data-bs-toggle="dropdown">Layanan Kemahasiswaan</a>
                                    <div className="dropdown-menu border-0 shadow rounded">
                                        <a href="tentang_beasiswa.html" className="dropdown-item">Beasiswa</a>
                                        <a href="konseling.html" className="dropdown-item">Konseling</a>
                                    </div>
                                </div>
                                <a href="blog.html" className="nav-item nav-link text-white">MPM</a>
                                <div className="nav-item dropdown">
                                    <a href="#" className="nav-link dropdown-toggle text-white" data-bs-toggle="dropdown">BEM</a>
                                    <div className="dropdown-menu border-0 shadow rounded">
                                        <a href="feature.html" className="dropdown-item">Departemen Agama dan Sosial</a>
                                        <a href="team.html" className="dropdown-item">Departemen Olahraga</a>
                                        <a href="testimonial.html" className="dropdown-item">Departemen Keb Dis</a>
                                        <a href="FAQ.html" className="dropdown-item">Departemen Sarana dan Prasarana</a>
                                        <a href="404.html" className="dropdown-item">Departemen Hubungan Masyarakat</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
            {/* Navbar End */}

            {/* Carousel Start */}
            <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <img src="/assets/images/carousel/slide.png" className="d-block w-100" alt="Slide 1" />
                        <div className="carousel-caption d-none d-md-block">
                            <h1 className="text-white">Direktorat Kemahasiswaan Institut Teknologi Del</h1>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img src="/assets/images/carousel/slide2.png" className="d-block w-100" alt="Slide 2" />
                        <div className="carousel-caption d-none d-md-block">
                            <h1 className="text-white">Fasilitas & Layanan Mahasiswa</h1>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img src="/assets/images/carousel/slide.svg" className="d-block w-100" alt="Slide 3" />
                        <div className="carousel-caption d-none d-md-block">
                            <h1 className="text-white">Bergabunglah dengan Kami</h1>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
            </div>
            {/* Carousel End */}

            {/* Social Media Icons */}
            <div className="social-media-container d-flex justify-content-center mt-4">
                <div className="social-icon mx-2"><i className="fab fa-instagram fa-2x text-primary"></i></div>
                <div className="social-icon mx-2"><i className="fab fa-whatsapp fa-2x text-success"></i></div>
                <div className="social-icon mx-2"><i className="fab fa-twitter fa-2x text-info"></i></div>
                <div className="social-icon mx-2"><i className="fab fa-line fa-2x text-success"></i></div>
                <div className="social-icon mx-2"><i className="fab fa-tiktok fa-2x"></i></div>
                <div className="social-icon mx-2"><i className="fab fa-youtube fa-2x text-danger"></i></div>
                <div className="social-icon mx-2"><i className="fab fa-facebook fa-2x text-primary"></i></div>
            </div>
        </>
    );
};

export default App;
