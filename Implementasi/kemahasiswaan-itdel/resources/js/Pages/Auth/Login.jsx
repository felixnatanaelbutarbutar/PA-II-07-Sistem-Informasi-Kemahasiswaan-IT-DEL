import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, error, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                reset('password');
            },
            onError: () => {
                if (errors.username) {
                    document.getElementById('username').focus();
                } else if (errors.password) {
                    document.getElementById('password').focus();
                }
            },
        });
    };

    return (
        <div
            className="min-h-screen bg-center"
            style={{
                backgroundImage: 'url(/assets/images/background/main-bg.png)',
                backgroundSize: '300px',
                backgroundRepeat: 'repeat',
            }}
        >
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl space-y-8">
                    <div className="text-center">
                        <img
                            src="/assets/images/login-logo/sub-logo.png"
                            alt="SPMB IT DEL"
                            className="mx-auto h-24 w-auto drop-shadow-lg"
                        />
                    </div>

                    <div className="hover:shadow-3xl transform overflow-hidden rounded-xl bg-white p-12 shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.02]">
                        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                            Login
                        </h2>

                        {/* NOTIFIKASI SUKSES (HIJAU) */}
                        {status && (
                            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        {/* NOTIFIKASI ERROR (MERAH) */}
                        {error && (
                            <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

                        {/* NOTIFIKASI ERROR DARI VALIDASI FORM */}
                        {(errors.username || errors.password) && (
                            <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm font-medium text-red-700">
                                {errors.username || errors.password || 'Terjadi kesalahan saat login. Silakan coba lagi.'}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-8">
                            <div className="relative">
                                <TextInput
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className={`peer block h-[70px] w-full rounded-lg border bg-transparent px-4 pt-6 text-lg transition-colors ${
                                        errors.username
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                    autoFocus
                                />
                                <label
                                    htmlFor="username"
                                    className="absolute left-4 top-6 text-[15px] font-medium text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                                >
                                    Username
                                </label>
                                <InputError message={errors.username} className="mt-1 text-xs" />
                            </div>

                            <div className="relative">
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className={`peer block h-[70px] w-full rounded-lg border bg-transparent px-4 pt-6 text-lg transition-colors ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-4 top-6 text-[15px] font-medium text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <svg
                                            className="h-6 w-6 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            {showPassword ? (
                                                <>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M17.25 17.25A9.956 9.956 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1 text-xs" />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="h-5 w-5 rounded-md border-gray-300 text-blue-900 transition-colors focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="remember" className="ml-2 block text-base text-gray-700">
                                    Ingat Saya
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="relative w-full overflow-hidden rounded-lg bg-[#001B3F] px-4 py-5 text-center text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-900 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="mr-2 h-5 w-5 animate-spin"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 0 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>

                        {canResetPassword && (
                            <div className="mt-8 w-full rounded-lg bg-gray-50 p-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Lupa Password?{' '}
                                        <Link
                                            href={route('password.request')}
                                            className="font-medium text-[#001B3F] transition-colors hover:text-blue-900"
                                        >
                                            Reset Password
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}