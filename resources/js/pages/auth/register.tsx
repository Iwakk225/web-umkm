import { Head, Link, useForm } from '@inertiajs/react';
import { FormError } from '@/components/pos-ui';
import { login as loginRoute } from '@/routes';
import {
    admin as registerAdmin,
    cashier as registerCashier,
} from '@/routes/register';
import { store as createCashier } from '@/routes/users';
import { store as createAdmin } from '@/routes/register/admin';

export default function Register({ role }: { role: 'admin' | 'kasir' }) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const isAdmin = role === 'admin';

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(isAdmin ? createAdmin.url() : createCashier.url());
    };

    return (
        <>
            <Head title={isAdmin ? 'Daftar pemilik' : 'Daftar kasir'} />
            <main className="grid min-h-screen bg-[#f2f6f2] lg:grid-cols-[0.9fr_1.1fr]">
                <section className="flex min-h-[200px] flex-col justify-between bg-[#173d2b] p-6 text-white sm:p-10 lg:min-h-screen">
                    <Link
                        href={loginRoute('admin')}
                        className="flex items-center gap-3"
                    >
                        <span className="grid h-10 w-10 place-items-center rounded-[4px] bg-[#f4c95d] text-lg font-black text-[#173d2b]">
                            R
                        </span>
                        <strong className="text-[15px]">RukunKasir</strong>
                    </Link>
                    <div className="mt-8">
                        <p className="text-[10px] font-bold tracking-[0.16em] text-[#aac6b0] uppercase">
                            AKSES TOKO
                        </p>
                        <h1 className="mt-3 max-w-sm text-[29px] leading-tight font-semibold">
                            {isAdmin
                                ? 'Akun pemilik pertama'
                                : 'Akun kasir baru'}
                        </h1>
                        <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-[#c0d1c5]">
                            {isAdmin
                                ? 'Admin pertama menjadi pemegang akses penuh toko.'
                                : 'Akun kasir dibuat oleh pemilik dan hanya dapat mengakses penjualan.'}
                        </p>
                    </div>
                    <p className="mt-8 text-[10px] text-[#b6c9bc]">
                        Kata sandi minimal 12 karakter, huruf besar-kecil, dan
                        angka.
                    </p>
                </section>
                <section className="flex items-center justify-center p-5 sm:p-10">
                    <div className="w-full max-w-[400px]">
                        <div className="mb-5 flex gap-2">
                            <Link
                                href={registerAdmin()}
                                className={`rounded-[3px] px-3 py-2 text-[10px] font-semibold ${isAdmin ? 'bg-[#173d2b] text-white' : 'border border-[#dfe8df] bg-white text-[#6e7e72]'}`}
                            >
                                Pemilik
                            </Link>
                            <Link
                                href={registerCashier()}
                                className={`rounded-[3px] px-3 py-2 text-[10px] font-semibold ${!isAdmin ? 'bg-[#173d2b] text-white' : 'border border-[#dfe8df] bg-white text-[#6e7e72]'}`}
                            >
                                Kasir
                            </Link>
                        </div>
                        <h2 className="text-[24px] font-semibold text-[#183b2a]">
                            Buat akun
                        </h2>
                        <p className="mt-1 text-[11px] text-[#79877e]">
                            Role akun ditetapkan oleh server.
                        </p>
                        <form onSubmit={submit} className="mt-5 space-y-3">
                            <label className="block text-[10px] font-semibold text-[#627367]">
                                Nama
                                <input
                                    required
                                    autoComplete="name"
                                    className="mt-1.5 h-11 w-full rounded-[3px] border border-[#dfe8df] px-3 text-[12px] outline-none"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                                <FormError message={form.errors.name} />
                            </label>
                            <label className="block text-[10px] font-semibold text-[#627367]">
                                Email
                                <input
                                    required
                                    type="email"
                                    autoComplete="email"
                                    className="mt-1.5 h-11 w-full rounded-[3px] border border-[#dfe8df] px-3 text-[12px] outline-none"
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
                                    autoComplete="new-password"
                                    className="mt-1.5 h-11 w-full rounded-[3px] border border-[#dfe8df] px-3 text-[12px] outline-none"
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                />
                                <FormError message={form.errors.password} />
                            </label>
                            <label className="block text-[10px] font-semibold text-[#627367]">
                                Ulangi kata sandi
                                <input
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    className="mt-1.5 h-11 w-full rounded-[3px] border border-[#dfe8df] px-3 text-[12px] outline-none"
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <button
                                disabled={form.processing}
                                className="mt-2 h-11 w-full rounded-[4px] bg-[#ed875e] text-[11px] font-bold text-white disabled:opacity-50"
                            >
                                {form.processing ? 'Menyimpan...' : 'Buat akun'}
                            </button>
                        </form>
                        <p className="mt-4 text-center text-[10px] text-[#79877e]">
                            Sudah punya akun?{' '}
                            <Link
                                href={loginRoute(role)}
                                className="font-semibold text-[#4e7355]"
                            >
                                Masuk
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
