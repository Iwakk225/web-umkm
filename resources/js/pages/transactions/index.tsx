import { router } from '@inertiajs/react';
import PosLayout from '@/layouts/pos-layout';
import { PageHeading, rupiah } from '@/components/pos-ui';
import { destroy as voidTransaction } from '@/routes/transactions';

type Transaction = {
    id: number;
    receipt_number: string;
    status: string;
    total_amount: number;
    total_cost: number;
    total_profit: number;
    created_at: string;
    user: { name: string } | null;
    items: {
        product_name: string;
        unit_name: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
        cost_total: number;
        profit: number;
    }[];
};

export default function Transactions({
    transactions,
    canVoid,
}: {
    transactions: { data: Transaction[] };
    canVoid: boolean;
}) {
    return (
        <PosLayout title="Transaksi">
            <PageHeading
                eyebrow="RIWAYAT PENJUALAN"
                title="Transaksi"
                detail="Nota dan snapshot HPP yang tersimpan tidak berubah saat harga produk diperbarui."
            />
            <section className="overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                <div className="border-b border-[#e8eee8] p-4">
                    <h2 className="text-[14px] font-semibold text-[#294634]">
                        Daftar nota
                    </h2>
                    <p className="mt-1 text-[10px] text-[#849087]">
                        Batalkan nota akan membuat log stok masuk, bukan
                        menghapus jejak audit.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                        <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                            <tr>
                                <th className="px-4 py-3">Nota / kasir</th>
                                <th className="px-3 py-3">Barang</th>
                                <th className="px-3 py-3">Total & HPP</th>
                                <th className="px-3 py-3">Profit</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf1ed]">
                            {transactions.data.map((transaction) => (
                                <tr key={transaction.id} className="align-top">
                                    <td className="px-4 py-3">
                                        <p className="text-[10px] font-semibold">
                                            {transaction.receipt_number}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#849087]">
                                            {transaction.user?.name ??
                                                'Akun dihapus'}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#9aa49c]">
                                            {new Date(
                                                transaction.created_at,
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="space-y-1">
                                            {transaction.items.map(
                                                (item, index) => (
                                                    <p
                                                        key={`${transaction.id}-${index}`}
                                                        className="text-[9px] text-[#69796d]"
                                                    >
                                                        {item.quantity}{' '}
                                                        {item.unit_name} ·{' '}
                                                        {item.product_name}
                                                    </p>
                                                ),
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <p className="text-[10px] font-semibold">
                                            {rupiah(transaction.total_amount)}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#849087]">
                                            HPP {rupiah(transaction.total_cost)}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3 text-[10px] font-semibold text-[#568267]">
                                        {rupiah(transaction.total_profit)}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-[3px] px-2 py-1 text-[9px] font-semibold ${transaction.status === 'paid' ? 'bg-[#eaf3eb] text-[#598062]' : 'bg-[#fff0e6] text-[#c66e4c]'}`}
                                        >
                                            {transaction.status === 'paid'
                                                ? 'Selesai'
                                                : 'Dibatalkan'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-start gap-2">
                                            <a
                                                target="_blank"
                                                rel="noreferrer"
                                                href={`https://wa.me/?text=${encodeURIComponent(`Nota ${transaction.receipt_number}\nTotal: ${rupiah(transaction.total_amount)}\nHPP: ${rupiah(transaction.total_cost)}\nProfit: ${rupiah(transaction.total_profit)}`)}`}
                                                className="text-[9px] font-semibold text-[#4e7355]"
                                            >
                                                Nota WhatsApp
                                            </a>
                                            {canVoid &&
                                                transaction.status ===
                                                    'paid' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    `Batalkan transaksi ${transaction.receipt_number}?`,
                                                                )
                                                            )
                                                                router.delete(
                                                                    voidTransaction.url(
                                                                        transaction.id,
                                                                    ),
                                                                );
                                                        }}
                                                        className="text-[9px] font-semibold text-[#bb7455]"
                                                    >
                                                        Batalkan
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {transactions.data.length === 0 && (
                    <p className="p-8 text-center text-[11px] text-[#849087]">
                        Belum ada transaksi tersimpan.
                    </p>
                )}
            </section>
        </PosLayout>
    );
}
