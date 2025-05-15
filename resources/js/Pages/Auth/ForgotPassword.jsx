import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
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
            <Head title="Lupa Password" />

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
                            Lupa Password
                        </h2>

                        {status && (
                            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

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
                                            Mengirim...
                                        </span>
                                    ) : (
                                        'Kirim Link Reset Password'
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
