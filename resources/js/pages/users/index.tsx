import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';
import {
    FormError,
    PageHeading,
    fieldClass,
    labelClass,
} from '@/components/pos-ui';
import { cashier as cashierRegistration } from '@/routes/register';
import {
    destroy as deleteUser,
    store as storeUser,
    update as updateUser,
} from '@/routes/users';

type Cashier = { id: number; name: string; email: string; created_at: string };

export default function Users({ users }: { users: Cashier[] }) {
    const [editing, setEditing] = useState<Cashier | null>(null);
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.put(updateUser.url(editing.id), {
                onSuccess: () => {
                    setEditing(null);
                    form.reset();
                },
            });
        } else {
            form.post(storeUser.url(), { onSuccess: () => form.reset() });
        }
    };

    return (
        <PosLayout title="Akun kasir">
            <PageHeading
                eyebrow="AKSES TOKO"
                title="Akun kasir"
                detail="Pemilik mengelola akun staf; role ditetapkan oleh server, bukan dari form."
                action={
                    <Link
                        href={cashierRegistration()}
                        className="rounded-[4px] bg-[#ed875e] px-3 py-2.5 text-[10px] font-bold text-white"
                    >
                        Buka halaman daftar kasir
                    </Link>
                }
            />
            <div className="grid items-start gap-5 xl:grid-cols-[340px_1fr]">
                <form
                    onSubmit={submit}
                    className="rounded-[5px] border border-[#e1e9e2] bg-white p-5"
                >
                    <h2 className="text-[14px] font-semibold text-[#294634]">
                        {editing ? 'Ubah akun kasir' : 'Akun kasir baru'}
                    </h2>
                    <label className={`${labelClass} mt-4`}>
                        Nama
                        <input
                            required
                            className={fieldClass}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                        />
                        <FormError message={form.errors.name} />
                    </label>
                    <label className={`${labelClass} mt-3`}>
                        Email
                        <input
                            required
                            type="email"
                            className={fieldClass}
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                        />
                        <FormError message={form.errors.email} />
                    </label>
                    <label className={`${labelClass} mt-3`}>
                        {editing ? 'Kata sandi baru (opsional)' : 'Kata sandi'}
                        <input
                            required={!editing}
                            type="password"
                            className={fieldClass}
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                        />
                        <FormError message={form.errors.password} />
                    </label>
                    <label className={`${labelClass} mt-3`}>
                        Ulangi kata sandi
                        <input
                            required={!editing && Boolean(form.data.password)}
                            type="password"
                            className={fieldClass}
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
                        className="mt-4 h-10 w-full rounded-[3px] bg-[#28563c] text-[11px] font-bold text-white disabled:opacity-50"
                    >
                        {editing ? 'Simpan perubahan' : 'Buat akun kasir'}
                    </button>
                    {editing && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(null);
                                form.reset();
                            }}
                            className="mt-2 h-9 w-full text-[10px] font-semibold text-[#758379]"
                        >
                            Batal ubah
                        </button>
                    )}
                </form>
                <section className="overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                    <div className="border-b border-[#e8eee8] p-4">
                        <h2 className="text-[14px] font-semibold text-[#294634]">
                            Staf aktif · {users.length}
                        </h2>
                    </div>
                    <div className="divide-y divide-[#edf1ed]">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex flex-wrap items-center gap-3 p-4"
                            >
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e1f0e3] text-[10px] font-bold text-[#4d8055]">
                                    {user.name.slice(0, 2).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-semibold">
                                        {user.name}
                                    </p>
                                    <p className="mt-1 truncate text-[10px] text-[#849087]">
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(user);
                                        form.setData({
                                            name: user.name,
                                            email: user.email,
                                            password: '',
                                            password_confirmation: '',
                                        });
                                    }}
                                    className="text-[9px] font-semibold text-[#4e7355]"
                                >
                                    Ubah
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                `Hapus akun ${user.name}?`,
                                            )
                                        )
                                            router.delete(
                                                deleteUser.url(user.id),
                                            );
                                    }}
                                    className="text-[9px] font-semibold text-[#bb7455]"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </PosLayout>
    );
}
