import { useForm } from '@inertiajs/react';
import PosLayout from '@/layouts/pos-layout';
import {
    FormError,
    Metric,
    PageHeading,
    fieldClass,
    labelClass,
} from '@/components/pos-ui';
import { store as stockStore, adjust as stockAdjust } from '@/routes/stock';

type Unit = {
    id: number;
    name: string;
    conversion_to_base: number;
    is_base_unit: boolean;
};
type Product = {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
    average_cost: number;
    units: Unit[];
};
type Log = {
    id: number;
    product: string;
    sku: string;
    type: string;
    quantity: number;
    stock_before: number;
    stock_after: number;
    note: string | null;
    user: string | null;
    created_at: string;
};
type Props = {
    products: Product[];
    logs: {
        data: Log[];
        links: { url: string | null; label: string; active: boolean }[];
    };
};

export default function Inventory({ products, logs }: Props) {
    const stockForm = useForm({
        product_unit_id: '',
        quantity: '1',
        unit_cost: '0',
        note: '',
    });
    const adjustmentForm = useForm({ delta: '', note: '' });
    const adjustmentProduct = products.find(
        (product) =>
            product.id === Number(adjustmentForm.data.delta.split(':')[0]),
    );
    const lowStockCount = products.filter(
        (product) => product.stock_quantity <= product.low_stock_threshold,
    ).length;
    const inventoryValue = products.reduce(
        (sum, product) => sum + product.stock_quantity * product.average_cost,
        0,
    );

    const submitStock = (event: React.FormEvent) => {
        event.preventDefault();
        stockForm.post(stockStore.url(), {
            onSuccess: () => stockForm.reset('quantity', 'unit_cost', 'note'),
        });
    };

    const selectAdjustment = (productId: number) => {
        adjustmentForm.setData({ delta: `${productId}:`, note: '' });
    };

    const submitAdjustment = (event: React.FormEvent) => {
        event.preventDefault();
        const [productId, delta] = adjustmentForm.data.delta.split(':');
        if (!productId || !delta) return;
        adjustmentForm.transform(() => ({
            delta: Number(delta),
            note: adjustmentForm.data.note,
        }));
        adjustmentForm.post(stockAdjust.url(Number(productId)), {
            onSuccess: () => adjustmentForm.reset(),
        });
    };

    return (
        <PosLayout title="Stok">
            <PageHeading
                eyebrow="INVENTARIS TOKO"
                title="Manajemen stok"
                detail="Catat barang masuk, penyesuaian, dan lihat jejak perubahan stok."
            />
            <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
                <Metric
                    label="Jenis produk aktif"
                    value={String(products.length)}
                    detail="Persediaan terdaftar"
                    symbol="▣"
                    tint="bg-[#e1f0e3] text-[#4d8055]"
                />
                <Metric
                    label="Stok menipis"
                    value={String(lowStockCount).padStart(2, '0')}
                    detail="Mencapai batas minimum"
                    symbol="!"
                    tint="bg-[#fff0d1] text-[#a47a20]"
                />
                <Metric
                    label="Nilai persediaan"
                    value={new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                    }).format(inventoryValue)}
                    detail="Stok dasar × HPP rata-rata"
                    symbol="Rp"
                    tint="bg-[#fce5da] text-[#c06e4c]"
                />
            </div>
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
                <section className="overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                    <div className="border-b border-[#e8eee8] p-4">
                        <h2 className="text-[14px] font-semibold text-[#294634]">
                            Persediaan
                        </h2>
                        <p className="mt-1 text-[10px] text-[#849087]">
                            Semua jumlah ditampilkan dalam satuan dasar
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left">
                            <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-3 py-3">Stok</th>
                                    <th className="px-3 py-3">Batas</th>
                                    <th className="px-3 py-3">Rata-rata HPP</th>
                                    <th className="px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ed]">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3">
                                            <p className="text-[10px] font-semibold text-[#344b39]">
                                                {product.name}
                                            </p>
                                            <p className="mt-1 text-[9px] text-[#929d94]">
                                                {product.sku}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-[11px] font-semibold">
                                            {product.stock_quantity}
                                        </td>
                                        <td className="px-3 py-3 text-[10px] text-[#69796d]">
                                            {product.low_stock_threshold}
                                        </td>
                                        <td className="px-3 py-3 text-[10px] text-[#69796d]">
                                            Rp{' '}
                                            {product.average_cost.toLocaleString(
                                                'id-ID',
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectAdjustment(product.id)
                                                }
                                                className="rounded-[3px] border border-[#dce7dc] px-2.5 py-1.5 text-[9px] font-semibold text-[#4e7355]"
                                            >
                                                Sesuaikan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                <div className="space-y-5">
                    <form
                        onSubmit={submitStock}
                        className="rounded-[5px] border border-[#e1e9e2] bg-white p-5"
                    >
                        <h2 className="text-[14px] font-semibold text-[#294634]">
                            Stok masuk
                        </h2>
                        <p className="mt-1 text-[10px] text-[#849087]">
                            HPP dihitung ulang dengan rata-rata tertimbang.
                        </p>
                        <label className={`${labelClass} mt-4`}>
                            Produk & satuan
                            <select
                                className={fieldClass}
                                value={stockForm.data.product_unit_id}
                                onChange={(event) =>
                                    stockForm.setData(
                                        'product_unit_id',
                                        event.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">Pilih unit pembelian</option>
                                {products.flatMap((product) =>
                                    product.units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {product.name} · {unit.name} (
                                            {unit.conversion_to_base} dasar)
                                        </option>
                                    )),
                                )}
                            </select>
                            <FormError
                                message={stockForm.errors.product_unit_id}
                            />
                        </label>
                        <label className={`${labelClass} mt-3`}>
                            Jumlah
                            <input
                                className={fieldClass}
                                type="number"
                                min="1"
                                value={stockForm.data.quantity}
                                onChange={(event) =>
                                    stockForm.setData(
                                        'quantity',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            <FormError message={stockForm.errors.quantity} />
                        </label>
                        <label className={`${labelClass} mt-3`}>
                            Harga pokok per unit beli (Rp)
                            <input
                                className={fieldClass}
                                type="number"
                                min="0"
                                value={stockForm.data.unit_cost}
                                onChange={(event) =>
                                    stockForm.setData(
                                        'unit_cost',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                        </label>
                        <label className={`${labelClass} mt-3`}>
                            Catatan
                            <input
                                className={fieldClass}
                                value={stockForm.data.note}
                                onChange={(event) =>
                                    stockForm.setData(
                                        'note',
                                        event.target.value,
                                    )
                                }
                                placeholder="Nama supplier / nomor nota"
                            />
                        </label>
                        <button
                            disabled={stockForm.processing}
                            className="mt-4 h-10 w-full rounded-[3px] bg-[#28563c] text-[11px] font-bold text-white disabled:opacity-50"
                        >
                            Simpan stok masuk
                        </button>
                    </form>
                    {adjustmentForm.data.delta.includes(':') && (
                        <form
                            onSubmit={submitAdjustment}
                            className="rounded-[5px] border border-[#e1e9e2] bg-white p-5"
                        >
                            <h2 className="text-[14px] font-semibold text-[#294634]">
                                Penyesuaian stok
                            </h2>
                            <p className="mt-1 text-[10px] text-[#849087]">
                                {adjustmentProduct?.name ??
                                    'Masukkan selisih stok dasar, gunakan angka negatif untuk pengurangan.'}
                            </p>
                            <label className={`${labelClass} mt-3`}>
                                Selisih satuan dasar
                                <input
                                    className={fieldClass}
                                    type="number"
                                    value={
                                        adjustmentForm.data.delta.split(
                                            ':',
                                        )[1] ?? ''
                                    }
                                    onChange={(event) =>
                                        adjustmentForm.setData(
                                            'delta',
                                            `${adjustmentForm.data.delta.split(':')[0]}:${event.target.value}`,
                                        )
                                    }
                                    placeholder="misalnya -2 atau 5"
                                    required
                                />
                            </label>
                            <label className={`${labelClass} mt-3`}>
                                Alasan
                                <input
                                    className={fieldClass}
                                    value={adjustmentForm.data.note}
                                    onChange={(event) =>
                                        adjustmentForm.setData(
                                            'note',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </label>
                            <button
                                disabled={adjustmentForm.processing}
                                className="mt-4 h-10 w-full rounded-[3px] border border-[#dce7dc] text-[11px] font-semibold text-[#4e7355]"
                            >
                                Simpan penyesuaian
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <section className="mt-5 overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                <div className="border-b border-[#e8eee8] p-4">
                    <h2 className="text-[14px] font-semibold text-[#294634]">
                        Riwayat stok
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                        <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-3 py-3">Produk</th>
                                <th className="px-3 py-3">Jenis</th>
                                <th className="px-3 py-3">Perubahan</th>
                                <th className="px-4 py-3">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf1ed]">
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-4 py-3 text-[9px] text-[#758379]">
                                        {new Date(
                                            log.created_at,
                                        ).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-3 py-3">
                                        <p className="text-[10px] font-semibold">
                                            {log.product}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#929d94]">
                                            {log.sku}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3 text-[10px]">
                                        {log.type}
                                    </td>
                                    <td className="px-3 py-3 text-[10px] font-semibold">
                                        {log.stock_before} → {log.stock_after}
                                    </td>
                                    <td className="px-4 py-3 text-[10px] text-[#758379]">
                                        {log.note ?? '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </PosLayout>
    );
}
