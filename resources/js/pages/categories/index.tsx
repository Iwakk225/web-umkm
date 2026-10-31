import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';
import {
    FormError,
    PageHeading,
    fieldClass,
    labelClass,
} from '@/components/pos-ui';
import {
    destroy as deleteCategory,
    store as storeCategory,
    update as updateCategory,
} from '@/routes/categories';

type Category = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
};

export default function Categories({ categories }: { categories: Category[] }) {
    const [editing, setEditing] = useState<Category | null>(null);
    const form = useForm({ name: '' });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.put(updateCategory.url(editing.id), {
                onSuccess: () => {
                    setEditing(null);
                    form.reset();
                },
            });
        } else {
            form.post(storeCategory.url(), { onSuccess: () => form.reset() });
        }
    };

    return (
        <PosLayout title="Kategori">
            <PageHeading
                eyebrow="KATALOG TOKO"
                title="Kategori produk"
                detail="Atur kelompok produk yang dipakai dalam inventaris."
            />
            <div className="grid items-start gap-5 xl:grid-cols-[340px_1fr]">
                <form
                    onSubmit={submit}
                    className="rounded-[5px] border border-[#e1e9e2] bg-white p-5"
                >
                    <h2 className="text-[14px] font-semibold text-[#294634]">
                        {editing ? 'Ubah kategori' : 'Kategori baru'}
                    </h2>
                    <label className={`${labelClass} mt-4`}>
                        Nama kategori
                        <input
                            required
                            maxLength={100}
                            className={fieldClass}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            placeholder="Misalnya: Sembako"
                        />
                        <FormError message={form.errors.name} />
                    </label>
                    <button
                        disabled={form.processing}
                        className="mt-4 h-10 w-full rounded-[3px] bg-[#28563c] text-[11px] font-bold text-white disabled:opacity-50"
                    >
                        {editing ? 'Simpan perubahan' : 'Tambah kategori'}
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
                            Batal
                        </button>
                    )}
                </form>
                <section className="overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                    <div className="border-b border-[#e8eee8] p-4">
                        <h2 className="text-[14px] font-semibold text-[#294634]">
                            Daftar kategori
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-left">
                            <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-3 py-3">Slug</th>
                                    <th className="px-3 py-3">Jumlah produk</th>
                                    <th className="px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ed]">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-4 py-3 text-[10px] font-semibold">
                                            {category.name}
                                        </td>
                                        <td className="px-3 py-3 text-[10px] text-[#758379]">
                                            {category.slug}
                                        </td>
                                        <td className="px-3 py-3 text-[10px]">
                                            {category.products_count}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditing(category);
                                                        form.setData(
                                                            'name',
                                                            category.name,
                                                        );
                                                    }}
                                                    className="text-[9px] font-semibold text-[#4e7355]"
                                                >
                                                    Ubah
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        category.products_count >
                                                        0
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Hapus kategori ${category.name}?`,
                                                            )
                                                        )
                                                            router.delete(
                                                                deleteCategory.url(
                                                                    category.id,
                                                                ),
                                                            );
                                                    }}
                                                    className="text-[9px] font-semibold text-[#bb7455] disabled:opacity-40"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </PosLayout>
    );
}
