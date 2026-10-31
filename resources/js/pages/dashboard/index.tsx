import { Link } from '@inertiajs/react';
import PosLayout from '@/layouts/pos-layout';
import { index as inventoryRoute } from '@/routes/stock';
import { index as reportsRoute } from '@/routes/reports';
import { index as transactionsRoute } from '@/routes/transactions';
import { Metric, PageHeading, rupiah } from '@/components/pos-ui';

type Totals = { sales: number; cost: number; profit: number; count: number };
type LowStockProduct = {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
    average_daily_base_milli: number;
    days_left_hundredths: number | null;
    base_unit: string | null;
};

type Props = {
    today: Totals;
    week: Totals;
    month: Totals;
    lowStock: LowStockProduct[];
    bestSellers: {
        product_name: string;
        quantity_base: number;
        profit: number;
    }[];
    recentTransactions: {
        id: number;
        receipt_number: string;
        total_amount: number;
        total_profit: number;
        created_at: string;
        user: { name: string } | null;
    }[];
    recentInventory: {
        id: number;
        type: string;
        quantity: number;
        product: { name: string; sku: string };
        created_at: string;
    }[];
};

const dateLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})
    .format(new Date())
    .toLocaleUpperCase('id-ID');

export default function Dashboard({
    today,
    week,
    month,
    lowStock,
    bestSellers,
    recentTransactions,
    recentInventory,
}: Props) {
    const maxSales = Math.max(today.sales, week.sales, month.sales, 1);
    const periods = [
        { label: 'Hari ini', totals: today },
        { label: 'Minggu ini', totals: week },
        { label: 'Bulan ini', totals: month },
    ];

    return (
        <PosLayout title="Ringkasan">
            <PageHeading
                eyebrow={dateLabel}
                title="Ringkasan toko"
                detail="Pantau penjualan, keuntungan, dan kondisi stok dari satu tempat."
            />
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Metric
                    label="Penjualan hari ini"
                    value={rupiah(today.sales)}
                    detail={`${today.count} transaksi selesai`}
                    symbol="↗"
                    tint="bg-[#e1f0e3] text-[#4d8055]"
                />
                <Metric
                    label="Keuntungan hari ini"
                    value={rupiah(today.profit)}
                    detail={`HPP ${rupiah(today.cost)}`}
                    symbol="+"
                    tint="bg-[#fff0d1] text-[#a47a20]"
                />
                <Metric
                    label="Penjualan bulan ini"
                    value={rupiah(month.sales)}
                    detail={`${month.count} transaksi bulan ini`}
                    symbol="#"
                    tint="bg-[#fce5da] text-[#c06e4c]"
                />
                <Metric
                    label="Produk menipis"
                    value={String(lowStock.length).padStart(2, '0')}
                    detail="Perlu ditinjau untuk restock"
                    symbol="!"
                    tint="bg-[#e3eaf4] text-[#54769a]"
                />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                <section className="rounded-[5px] border border-[#e1e9e2] bg-white p-5 sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-semibold text-[#24412f]">
                                Penjualan per periode
                            </h2>
                            <p className="mt-1 text-[11px] text-[#849087]">
                                Nilai penjualan dan margin tercatat dari
                                transaksi
                            </p>
                        </div>
                        <Link
                            href={reportsRoute()}
                            className="text-[10px] font-semibold text-[#52805b]"
                        >
                            Laporan →
                        </Link>
                    </div>
                    <div className="grid h-[180px] grid-cols-3 items-end gap-5 border-b border-[#e8eee8] px-3 pb-2">
                        {periods.map(({ label, totals }) => (
                            <div
                                key={label}
                                className="flex h-full flex-col items-center justify-end gap-2"
                            >
                                <span className="text-[9px] font-semibold text-[#718174]">
                                    {rupiah(totals.sales)}
                                </span>
                                <div
                                    className="w-full max-w-[70px] rounded-t-[3px] bg-[#c7ddc9]"
                                    style={{
                                        height: `${Math.max((totals.sales / maxSales) * 75, 5)}%`,
                                    }}
                                />
                                <span className="text-[9px] text-[#929d94]">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between text-[11px]">
                        <span className="text-[#839087]">
                            Profit minggu ini
                        </span>
                        <strong className="text-[#52805b]">
                            {rupiah(week.profit)}
                        </strong>
                    </div>
                </section>

                <section className="rounded-[5px] border border-[#e1e9e2] bg-white p-5 sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-semibold text-[#24412f]">
                                Perlu restock
                            </h2>
                            <p className="mt-1 text-[11px] text-[#849087]">
                                Rata-rata penjualan tujuh hari terakhir
                            </p>
                        </div>
                        <Link
                            href={inventoryRoute()}
                            className="text-[10px] font-semibold text-[#52805b]"
                        >
                            Stok →
                        </Link>
                    </div>
                    <div className="divide-y divide-[#edf1ed]">
                        {lowStock.length ? (
                            lowStock.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <span className="grid h-9 w-9 place-items-center rounded-[4px] bg-[#fff0e6] text-[10px] font-bold text-[#a5684d]">
                                        {product.sku.slice(0, 2)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[11px] font-semibold text-[#354b3b]">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#849087]">
                                            Sisa {product.stock_quantity}{' '}
                                            {product.base_unit ?? 'unit'} ·{' '}
                                            {product.days_left_hundredths ===
                                            null
                                                ? 'belum ada data penjualan'
                                                : `habis ±${(product.days_left_hundredths / 100).toLocaleString('id-ID')} hari`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-5 text-center text-xs text-[#7f8d82]">
                                Semua stok berada di atas batas minimum.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <section className="rounded-[5px] border border-[#e1e9e2] bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-[14px] font-semibold text-[#24412f]">
                            Transaksi terbaru
                        </h2>
                        <Link
                            href={transactionsRoute()}
                            className="text-[10px] font-semibold text-[#52805b]"
                        >
                            Semua transaksi →
                        </Link>
                    </div>
                    <div className="divide-y divide-[#edf1ed]">
                        {recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between gap-3 py-3"
                            >
                                <div>
                                    <p className="text-[10px] font-semibold text-[#354b3b]">
                                        {transaction.receipt_number}
                                    </p>
                                    <p className="mt-1 text-[9px] text-[#849087]">
                                        {transaction.user?.name ??
                                            'Akun dihapus'}{' '}
                                        ·{' '}
                                        {new Date(
                                            transaction.created_at,
                                        ).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold">
                                        {rupiah(transaction.total_amount)}
                                    </p>
                                    <p className="mt-1 text-[9px] text-[#568267]">
                                        Profit{' '}
                                        {rupiah(transaction.total_profit)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="rounded-[5px] border border-[#e1e9e2] bg-white p-5">
                    <h2 className="mb-3 text-[14px] font-semibold text-[#24412f]">
                        Produk terlaris bulan ini
                    </h2>
                    <div className="divide-y divide-[#edf1ed]">
                        {bestSellers.map((item, index) => (
                            <div
                                key={item.product_name}
                                className="flex items-center gap-3 py-3"
                            >
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#edf4ed] text-[10px] font-bold text-[#56775a]">
                                    {index + 1}
                                </span>
                                <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-[#354b3b]">
                                    {item.product_name}
                                </p>
                                <div className="text-right">
                                    <p className="text-[9px] text-[#849087]">
                                        {item.quantity_base} unit dasar
                                    </p>
                                    <p className="mt-1 text-[9px] font-semibold text-[#568267]">
                                        Profit {rupiah(item.profit)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 border-t border-[#edf1ed] pt-2">
                        {recentInventory.slice(0, 2).map((log) => (
                            <p
                                key={log.id}
                                className="py-1 text-[9px] text-[#849087]"
                            >
                                {log.type === 'masuk' ? '+' : '−'}
                                {log.quantity} · {log.product.name}
                            </p>
                        ))}
                    </div>
                </section>
            </div>
        </PosLayout>
    );
}
