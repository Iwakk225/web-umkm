import { Link } from '@inertiajs/react';
import PosLayout from '@/layouts/pos-layout';
import { Metric, PageHeading, rupiah } from '@/components/pos-ui';
import { index as reportsRoute } from '@/routes/reports';

type Summary = { sales: number; cost: number; profit: number; count: number };
type Props = {
    period: 'hari' | 'minggu' | 'bulan';
    summary: Summary;
    daily: { day: string; sales: number; profit: number }[];
    bestSellers: {
        product_name: string;
        quantity_base: number;
        sales: number;
        profit: number;
    }[];
    transactions: {
        data: {
            id: number;
            receipt_number: string;
            status: string;
            total_amount: number;
            total_profit: number;
            created_at: string;
            user: { name: string } | null;
            items: {
                product_name: string;
                quantity: number;
                unit_name: string;
            }[];
        }[];
    };
};

export default function Reports({
    period,
    summary,
    daily,
    bestSellers,
    transactions,
}: Props) {
    const maxSales = Math.max(...daily.map((item) => item.sales), 1);
    const periodLabels = {
        hari: 'Hari ini',
        minggu: 'Minggu ini',
        bulan: 'Bulan ini',
    };

    return (
        <PosLayout title="Laporan">
            <PageHeading
                eyebrow="ANALISIS USAHA"
                title="Laporan penjualan"
                detail="Penjualan, HPP, dan keuntungan dari transaksi tersimpan."
            />
            <div className="mb-5 flex w-fit gap-1 rounded-[4px] border border-[#e1e9e2] bg-white p-1">
                {Object.entries(periodLabels).map(([key, label]) => (
                    <Link
                        key={key}
                        href={reportsRoute({ query: { period: key } })}
                        className={`rounded-[3px] px-4 py-2 text-[10px] font-semibold ${period === key ? 'bg-[#173d2b] text-white' : 'text-[#6e7e72]'}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Metric
                    label="Total penjualan"
                    value={rupiah(summary.sales)}
                    detail={periodLabels[period]}
                    symbol="↗"
                    tint="bg-[#e1f0e3] text-[#4d8055]"
                />
                <Metric
                    label="HPP"
                    value={rupiah(summary.cost)}
                    detail="Harga pokok barang terjual"
                    symbol="−"
                    tint="bg-[#e3eaf4] text-[#54769a]"
                />
                <Metric
                    label="Keuntungan"
                    value={rupiah(summary.profit)}
                    detail="Penjualan dikurangi HPP"
                    symbol="+"
                    tint="bg-[#fff0d1] text-[#a47a20]"
                />
                <Metric
                    label="Transaksi"
                    value={String(summary.count)}
                    detail="Transaksi selesai"
                    symbol="#"
                    tint="bg-[#fce5da] text-[#c06e4c]"
                />
            </div>
            <section className="mt-5 rounded-[5px] border border-[#e1e9e2] bg-white p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-[15px] font-semibold text-[#24412f]">
                        Tren harian
                    </h2>
                    <p className="mt-1 text-[11px] text-[#849087]">
                        Angka berdasarkan data transaksi di database
                    </p>
                </div>
                <div className="flex h-[220px] items-end gap-2 overflow-x-auto border-b border-[#e8eee8] px-1 pb-2">
                    {daily.length ? (
                        daily.map((item) => (
                            <div
                                key={item.day}
                                className="flex h-full min-w-[40px] flex-1 flex-col items-center justify-end gap-2"
                            >
                                <span className="text-[8px] text-[#849087]">
                                    {rupiah(item.sales)}
                                </span>
                                <div
                                    className="w-full max-w-[34px] rounded-t-[2px] bg-[#b9d3bd]"
                                    style={{
                                        height: `${Math.max((item.sales / maxSales) * 65, 4)}%`,
                                    }}
                                />
                                <span className="text-[8px] text-[#929d94]">
                                    {new Date(
                                        `${item.day}T00:00:00`,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="m-auto text-[11px] text-[#8b978e]">
                            Belum ada transaksi pada periode ini.
                        </p>
                    )}
                </div>
            </section>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.3fr]">
                <section className="rounded-[5px] border border-[#e1e9e2] bg-white p-5">
                    <h2 className="mb-3 text-[14px] font-semibold text-[#294634]">
                        Produk terlaris
                    </h2>
                    <div className="divide-y divide-[#edf1ed]">
                        {bestSellers.map((product, index) => (
                            <div
                                key={product.product_name}
                                className="flex items-center gap-3 py-3"
                            >
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#edf4ed] text-[10px] font-bold text-[#56775a]">
                                    {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10px] font-semibold">
                                        {product.product_name}
                                    </p>
                                    <p className="mt-1 text-[9px] text-[#849087]">
                                        {product.quantity_base} satuan dasar
                                    </p>
                                </div>
                                <p className="text-[10px] font-semibold text-[#568267]">
                                    {rupiah(product.profit)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                    <div className="border-b border-[#e8eee8] p-4">
                        <h2 className="text-[14px] font-semibold text-[#294634]">
                            Rincian transaksi
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-left">
                            <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Nota / kasir</th>
                                    <th className="px-3 py-3">Waktu</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-4 py-3">
                                        Total / profit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ed]">
                                {transactions.data.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="px-4 py-3">
                                            <p className="text-[10px] font-semibold">
                                                {transaction.receipt_number}
                                            </p>
                                            <p className="mt-1 text-[9px] text-[#849087]">
                                                {transaction.user?.name ??
                                                    'Akun dihapus'}{' '}
                                                · {transaction.items.length}{' '}
                                                baris
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-[9px] text-[#758379]">
                                            {new Date(
                                                transaction.created_at,
                                            ).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-3 py-3 text-[9px]">
                                            {transaction.status === 'paid'
                                                ? 'Selesai'
                                                : 'Dibatalkan'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-[10px] font-semibold">
                                                {rupiah(
                                                    transaction.total_amount,
                                                )}
                                            </p>
                                            <p className="mt-1 text-[9px] text-[#568267]">
                                                {rupiah(
                                                    transaction.total_profit,
                                                )}
                                            </p>
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
