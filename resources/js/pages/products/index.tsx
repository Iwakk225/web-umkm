import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';
import {
    FormError,
    PageHeading,
    fieldClass,
    labelClass,
    rupiah,
} from '@/components/pos-ui';
import {
    destroy as deleteProduct,
    store as storeProduct,
    update as updateProduct,
} from '@/routes/products';

type Tier = { id: number; min_qty: number; price: number };
type Unit = {
    id: number;
    name: string;
    conversion_to_base: number;
    barcode: string | null;
    is_base_unit: boolean;
    price_tiers: Tier[];
};
type Product = {
    id: number;
    name: string;
    sku: string;
    category_id: number | null;
    category: { name: string } | null;
    stock_quantity: number;
    low_stock_threshold: number;
    average_cost: number;
    units: Unit[];
};
type Category = { id: number; name: string };
type FormData = {
    category_id: string;
    sku: string;
    name: string;
    low_stock_threshold: string;
    base_unit: string;
    base_price: string;
    base_barcode: string;
    wholesale_min_qty: string;
    wholesale_price: string;
    pack_unit: string;
    pack_conversion: string;
    pack_price: string;
    pack_barcode: string;
    pack_wholesale_min_qty: string;
    pack_wholesale_price: string;
};

const emptyForm: FormData = {
    category_id: '',
    sku: '',
    name: '',
    low_stock_threshold: '0',
    base_unit: 'pcs',
    base_price: '',
    base_barcode: '',
    wholesale_min_qty: '',
    wholesale_price: '',
    pack_unit: '',
    pack_conversion: '',
    pack_price: '',
    pack_barcode: '',
    pack_wholesale_min_qty: '',
    pack_wholesale_price: '',
};

function firstTier(
    unit: Unit | undefined,
    minimum: number,
): number | undefined {
    return unit?.price_tiers.find((tier) => tier.min_qty === minimum)?.price;
}

export default function Products({
    products,
    categories,
}: {
    products: Product[];
    categories: Category[];
}) {
    const [editing, setEditing] = useState<Product | null>(null);
    const [search, setSearch] = useState('');
    const form = useForm<FormData>(emptyForm);
    const filteredProducts = products.filter((product) =>
        `${product.name} ${product.sku} ${product.category?.name ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.put(updateProduct.url(editing.id), {
                onSuccess: () => {
                    setEditing(null);
                    form.reset();
                },
            });
        } else {
            form.post(storeProduct.url(), { onSuccess: () => form.reset() });
        }
    };

    const beginEdit = (product: Product) => {
        const base = product.units.find((unit) => unit.is_base_unit);
        const pack = product.units.find((unit) => !unit.is_base_unit);
        const wholesale = base?.price_tiers.find((tier) => tier.min_qty > 1);
        const packWholesale = pack?.price_tiers.find(
            (tier) => tier.min_qty > 1,
        );
        setEditing(product);
        form.setData({
            category_id: product.category_id ? String(product.category_id) : '',
            sku: product.sku,
            name: product.name,
            low_stock_threshold: String(product.low_stock_threshold),
            base_unit: base?.name ?? 'pcs',
            base_price: String(firstTier(base, 1) ?? ''),
            base_barcode: base?.barcode ?? '',
            wholesale_min_qty: wholesale ? String(wholesale.min_qty) : '',
            wholesale_price: wholesale ? String(wholesale.price) : '',
            pack_unit: pack?.name ?? '',
            pack_conversion: pack ? String(pack.conversion_to_base) : '',
            pack_price: String(firstTier(pack, 1) ?? ''),
            pack_barcode: pack?.barcode ?? '',
            pack_wholesale_min_qty: packWholesale
                ? String(packWholesale.min_qty)
                : '',
            pack_wholesale_price: packWholesale
                ? String(packWholesale.price)
                : '',
        });
    };

    const field = (
        name: keyof FormData,
        label: string,
        type = 'text',
        required = false,
    ) => (
        <label className={labelClass}>
            {label}
            <input
                className={fieldClass}
                type={type}
                required={required}
                min={type === 'number' ? 0 : undefined}
                value={form.data[name]}
                onChange={(event) => form.setData(name, event.target.value)}
            />
            <FormError message={form.errors[name]} />
        </label>
    );

    return (
        <PosLayout title="Produk">
            <PageHeading
                eyebrow="KATALOG TOKO"
                title="Produk & harga"
                detail="Kelola satuan dasar, konversi, barcode, dan tier harga grosir."
            />
            <div className="grid items-start gap-5 2xl:grid-cols-[1fr_390px]">
                <section className="overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eee8] p-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-[#294634]">
                                Daftar produk
                            </h2>
                            <p className="mt-1 text-[10px] text-[#849087]">
                                {products.length} produk aktif
                            </p>
                        </div>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama / SKU"
                            className="h-9 w-full rounded-[3px] border border-[#e0e8e0] px-3 text-[10px] outline-none sm:w-48"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left">
                            <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Produk / SKU</th>
                                    <th className="px-3 py-3">Kategori</th>
                                    <th className="px-3 py-3">
                                        Satuan & harga
                                    </th>
                                    <th className="px-3 py-3">Stok dasar</th>
                                    <th className="px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ed]">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3">
                                            <p className="text-[10px] font-semibold">
                                                {product.name}
                                            </p>
                                            <p className="mt-1 text-[9px] text-[#929d94]">
                                                {product.sku}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-[10px]">
                                            {product.category?.name ??
                                                'Tanpa kategori'}
                                        </td>
                                        <td className="px-3 py-3">
                                            {product.units.map((unit) => (
                                                <p
                                                    key={unit.id}
                                                    className="py-0.5 text-[9px] text-[#637569]"
                                                >
                                                    {unit.name}:{' '}
                                                    {rupiah(
                                                        firstTier(unit, 1) ?? 0,
                                                    )}
                                                    {unit.price_tiers.some(
                                                        (tier) =>
                                                            tier.min_qty > 1,
                                                    ) &&
                                                        ` · grosir ${rupiah(Math.min(...unit.price_tiers.filter((tier) => tier.min_qty > 1).map((tier) => tier.price)))}`}
                                                </p>
                                            ))}
                                        </td>
                                        <td className="px-3 py-3 text-[10px] font-semibold">
                                            {product.stock_quantity}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        beginEdit(product)
                                                    }
                                                    className="text-[9px] font-semibold text-[#4e7355]"
                                                >
                                                    Ubah
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Arsipkan ${product.name}?`,
                                                            )
                                                        )
                                                            router.delete(
                                                                deleteProduct.url(
                                                                    product.id,
                                                                ),
                                                            );
                                                    }}
                                                    className="text-[9px] font-semibold text-[#bb7455]"
                                                >
                                                    Arsip
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <form
                    onSubmit={submit}
                    className="rounded-[5px] border border-[#e1e9e2] bg-white p-5"
                >
                    <div className="mb-4 flex items-start justify-between gap-2">
                        <div>
                            <h2 className="text-[14px] font-semibold text-[#294634]">
                                {editing ? 'Ubah produk' : 'Tambah produk'}
                            </h2>
                            <p className="mt-1 text-[10px] text-[#849087]">
                                Stok awal diisi melalui menu stok masuk.
                            </p>
                        </div>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(null);
                                    form.reset();
                                }}
                                className="text-[10px] font-semibold text-[#bd7455]"
                            >
                                Batal
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {field('name', 'Nama produk', 'text', true)}
                        {field('sku', 'SKU', 'text', true)}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className={labelClass}>
                            Kategori
                            <select
                                className={fieldClass}
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'category_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Tanpa kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {field(
                            'low_stock_threshold',
                            'Batas stok',
                            'number',
                            true,
                        )}
                    </div>
                    <div className="mt-4 border-t border-[#edf1ed] pt-3">
                        <p className="mb-3 text-[10px] font-bold text-[#56705b]">
                            Satuan dasar & harga
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {field(
                                'base_unit',
                                'Nama satuan dasar',
                                'text',
                                true,
                            )}
                            {field(
                                'base_price',
                                'Harga jual (Rp)',
                                'number',
                                true,
                            )}
                            {field('base_barcode', 'Barcode dasar')}
                            {field(
                                'wholesale_min_qty',
                                'Mulai grosir (jumlah)',
                                'number',
                            )}
                            {field(
                                'wholesale_price',
                                'Harga grosir (Rp)',
                                'number',
                            )}
                        </div>
                    </div>
                    <div className="mt-4 border-t border-[#edf1ed] pt-3">
                        <p className="mb-3 text-[10px] font-bold text-[#56705b]">
                            Satuan kemasan (opsional)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {field('pack_unit', 'Nama kemasan')}
                            {field(
                                'pack_conversion',
                                'Konversi ke dasar',
                                'number',
                            )}
                            {field(
                                'pack_price',
                                'Harga jual kemasan (Rp)',
                                'number',
                            )}
                            {field('pack_barcode', 'Barcode kemasan')}
                            {field(
                                'pack_wholesale_min_qty',
                                'Grosir kemasan mulai',
                                'number',
                            )}
                            {field(
                                'pack_wholesale_price',
                                'Harga grosir kemasan (Rp)',
                                'number',
                            )}
                        </div>
                    </div>
                    <button
                        disabled={form.processing}
                        className="mt-5 h-10 w-full rounded-[3px] bg-[#28563c] text-[11px] font-bold text-white disabled:opacity-50"
                    >
                        {editing ? 'Simpan perubahan produk' : 'Simpan produk'}
                    </button>
                </form>
            </div>
        </PosLayout>
    );
}
