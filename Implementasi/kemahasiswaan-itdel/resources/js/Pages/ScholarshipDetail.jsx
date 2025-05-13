import { Head, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayoutPage from '@/Layouts/NavbarGuestLayoutPage';
import FooterLayout from '@/Layouts/FooterLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ScholarshipDetail() {
    const { scholarship, form, auth = {}, userRole, flash } = usePage().props;
    const isMahasiswa = userRole === 'mahasiswa';
    const isAuthenticated = !!auth?.user;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Fetch submission status for authenticated students
    useEffect(() => {
        if (isMahasiswa && form?.form_id && isAuthenticated && auth?.user?.token) {
            setIsLoading(true);
            axios
                .get(`/api/forms/submissions?form_id=${form.form_id}`, {
                    headers: {
                        Authorization: `Bearer ${auth.user.token}`,
                    },
                })
                .then((response) => {
                    const submissions = response.data.submissions || [];
                    setHasSubmitted(submissions.some((s) => s.form_id === form.form_id));
                    setIsLoading(false);
                })
                .catch((err) => {
                    setError('Gagal memuat status pengajuan');
                    setIsLoading(false);
                    console.error('Error fetching submissions:', err);
                });
        }
    }, [isMahasiswa, form?.form_id, isAuthenticated, auth?.user?.token]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <GuestLayout>
            <NavbarGuestLayoutPage />
            <Head title={scholarship?.name || 'Detail Beasiswa'} />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow-sm">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
                            {flash.error}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
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
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                            {/* Breadcrumb */}
                            <nav className="mb-6 text-sm text-gray-600">
                                <Link href="/" className="text-blue-600 hover:underline">
                                    Beranda
                                </Link>
                                <span className="mx-2">/</span>
                                <Link href="/scholarships" className="text-blue-600 hover:underline">
                                    Beasiswa
                                </Link>
                                <span className="mx-2">/</span>
                                <span>{scholarship?.name || 'Detail'}</span>
                            </nav>

                            {/* Scholarship Details */}
                            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4">
                                {scholarship?.name || '-'}
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {scholarship?.description || 'Tidak ada deskripsi.'}
                            </p>
                            <div className="space-y-2 mb-6">
                                <p className="text-sm">
                                    <span className="font-semibold text-blue-700">Kategori:</span>{' '}
                                    {scholarship?.category?.name || '-'}
                                </p>
                                {form ? (
                                    <>
                                        <p className="text-sm">
                                            <span className="font-semibold text-blue-700">Formulir:</span>{' '}
                                            {form.form_name || '-'}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold text-blue-700">Pendaftaran:</span>{' '}
                                            {formatDate(form.open_date)}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold text-blue-700">Berakhir:</span>{' '}
                                            {formatDate(form.close_date)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm">
                                        <span className="font-semibold text-blue-700">Formulir:</span>{' '}
                                        Tidak tersedia
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4">
                                {form?.is_active ? (
                                    <Link
                                        href={`/scholarships/form/${form.form_id}`}
                                        className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                                            isMahasiswa && hasSubmitted && isAuthenticated
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                                        }`}
                                    >
                                        {isMahasiswa && hasSubmitted && isAuthenticated
                                            ? 'Sudah Diajukan'
                                            : 'Ajukan Beasiswa'}
                                    </Link>
                                ) : (
                                    <span className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium">
                                        Pendaftaran Ditutup
                                    </span>
                                )}
                                <Link
                                    href="/scholarships"
                                    className="px-4 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 hover:shadow-lg transition-all duration-200"
                                >
                                    Kembali
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <FooterLayout />
        </GuestLayout>
    );
}
