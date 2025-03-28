import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
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
            <Head title="Reset Password" />

            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl space-y-8">
                    <div className="text-center">
                        <img
                            src="/assets/images/login-logo/sub-logo.png"
                            alt="SPMB IT DEL"
                            className="mx-auto h-24 w-auto drop-shadow-lg"
                        />
                    </div>

                    <div className="transform overflow-hidden rounded-xl bg-white p-12 shadow-2xl transition-all">
                        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                            Reset Password
                        </h2>

                        <form onSubmit={submit} className="space-y-8">
                            <div className="relative">
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`peer block h-[70px] w-full rounded-lg border bg-transparent px-4 pt-6 text-lg transition-colors ${
                                        errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-4 top-6 text-[15px] font-medium text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                                >
                                    Email
                                </label>
                                <InputError
                                    message={errors.email}
                                    className="mt-1 text-xs"
                                />
                            </div>

                            <div className="relative">
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        value={data.password}
                                        className={`peer block h-[70px] w-full rounded-lg border bg-transparent px-4 pt-6 text-lg transition-colors ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-4 top-6 text-[15px] font-medium text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                                    >
                                        Password Baru
                                    </label>
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        <svg
                                            className="h-6 w-6 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d={
                                                    showPassword
                                                        ? 'M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823'
                                                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                }
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d={
                                                    showPassword
                                                        ? 'M17.25 17.25A9.956 9.956 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.32 5.18'
                                                        : 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                                }
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-1 text-xs"
                                />
                            </div>

                            <div className="relative">
                                <div className="relative">
                                    <TextInput
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className={`peer block h-[70px] w-full rounded-lg border bg-transparent px-4 pt-6 text-lg transition-colors ${
                                            errors.password_confirmation
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <label
                                        htmlFor="password_confirmation"
                                        className="absolute left-4 top-6 text-[15px] font-medium text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                                    >
                                        Konfirmasi Password Baru
                                    </label>
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                    >
                                        <svg
                                            className="h-6 w-6 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d={
                                                    showConfirmPassword
                                                        ? 'M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823'
                                                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                }
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d={
                                                    showConfirmPassword
                                                        ? 'M17.25 17.25A9.956 9.956 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.32 5.18'
                                                        : 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                                }
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-1 text-xs"
                                />
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
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Memproses...
                                        </span>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 w-full rounded-lg bg-gray-50 p-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Ingat password Anda?{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-medium text-[#001B3F] transition-colors hover:text-blue-900"
                                    >
                                        Kembali ke Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
