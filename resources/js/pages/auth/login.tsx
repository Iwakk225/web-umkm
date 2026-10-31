import { Head, Link, useForm } from '@inertiajs/react';
import { FormError } from '@/components/pos-ui';
import { login as loginRoute } from '@/routes';
import { store as loginStore } from '@/routes/login';
import { admin as registerAdmin } from '@/routes/register';

export default function Login({
    role,
    adminRegistered,
}: {
    role: 'admin' | 'kasir';
    adminRegistered: boolean;
}) {
    const form = useForm({ email: '', password: '', remember: false });
    const roleLabel = role === 'admin' ? 'Pemilik toko' : 'Kasir';

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(loginStore.url(role));
    };

    return (
        <>
            <Head title={`Masuk · ${roleLabel}`} />
            <main className="grid min-h-screen bg-[#f2f6f2] lg:grid-cols-[0.9fr_1.1fr]">
                <section className="flex min-h-[220px] flex-col justify-between bg-[#173d2b] p-6 text-white sm:p-10 lg:min-h-screen">
                    <Link
                        href={loginRoute('admin')}
                        className="flex items-center gap-3"
                    >
                        <span className="grid h-10 w-10 place-items-center rounded-[4px] bg-[#f4c95d] text-lg font-black text-[#173d2b]">
                            R
                        </span>
                        <span>
                            <strong className="block text-[15px]">
                                RukunKasir
                            </strong>
                            <small className="text-[9px] text-[#b6c9bc]">
                                TOKO KELONTONG
                            </small>
                        </span>
                    </Link>
                    <div className="mt-8">
                        <p className="text-[10px] font-bold tracking-[0.16em] text-[#aac6b0] uppercase">
                            RUANG OPERASIONAL
                        </p>
                        <h1 className="mt-3 max-w-sm text-[29px] leading-tight font-semibold">
                            Semua transaksi, stok, dan profit tercatat rapi.
                        </h1>
                    </div>
                    <p className="mt-8 text-[10px] text-[#b6c9bc]">
                        POS internal · Data tersimpan di database toko
                    </p>
                </section>
                <section className="flex items-center justify-center p-5 sm:p-10">
                    <div className="w-full max-w-[390px]">
                        <div className="mb-6 flex gap-2 rounded-[4px] border border-[#dfe8df] bg-white p-1">
                            <Link
                                href={loginRoute('admin')}
                                className={`flex-1 rounded-[3px] px-3 py-2.5 text-center text-[10px] font-semibold ${role === 'admin' ? 'bg-[#173d2b] text-white' : 'text-[#6e7e72]'}`}
                            >
                                Pemilik
                            </Link>
                            <Link
                                href={loginRoute('kasir')}
                                className={`flex-1 rounded-[3px] px-3 py-2.5 text-center text-[10px] font-semibold ${role === 'kasir' ? 'bg-[#173d2b] text-white' : 'text-[#6e7e72]'}`}
                            >
                                Kasir
                            </Link>
                        </div>
                        <p className="text-[10px] font-bold tracking-[0.14em] text-[#74867b] uppercase">
                            MASUK SEBAGAI {roleLabel.toUpperCase()}
                        </p>
                        <h2 className="mt-2 text-[25px] font-semibold text-[#183b2a]">
                            Selamat datang
                        </h2>
                        <p className="mt-1 text-[12px] text-[#79877e]">
                            Masuk dengan akun toko yang terdaftar.
                        </p>
                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <label className="block text-[10px] font-semibold text-[#627367]">
                                Email
                                <input
                                    required
                                    type="email"
                                    autoComplete="username"
                                    className="mt-1.5 h-11 w-full rounded-[3px] border border-[#dfe8df] bg-white px-3 text-[12px] outline-none focus:border-[#83a98a]"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                                <FormError message={form.errors.email} />
                            </label>
                            <label className="block text-[10px] font-semibold text-[#627367]">
                                Kata sandi
                                <input
                                    required
                                    type="password"
                                    autoComplete="current-password"
                                    className="mt-1.5 h-11 w-full rounded-[3px] border border-[#dfe8df] bg-white px-3 text-[12px] outline-none focus:border-[#83a98a]"
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label className="flex items-center gap-2 text-[10px] text-[#718174]">
                                <input
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(event) =>
                                        form.setData(
                                            'remember',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Ingat saya di perangkat ini
                            </label>
                            <button
                                disabled={form.processing}
                                className="h-11 w-full rounded-[4px] bg-[#ed875e] text-[11px] font-bold text-white disabled:opacity-50"
                            >
                                {form.processing ? 'Memeriksa...' : 'Masuk'}
                            </button>
                        </form>
                        {role === 'admin' && !adminRegistered && (
                            <p className="mt-5 text-center text-[10px] text-[#79877e]">
                                Belum ada admin?{' '}
                                <Link
                                    href={registerAdmin()}
                                    className="font-semibold text-[#4e7355]"
                                >
                                    Buat akun pemilik pertama
                                </Link>
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
