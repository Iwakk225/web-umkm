import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import PosLayout from '@/layouts/pos-layout';
import { FormError, PageHeading, rupiah } from '@/components/pos-ui';
import { store as transactionStore } from '@/routes/transactions';

type PriceTier = { id: number; min_qty: number; price: number };
type Unit = {
    id: number;
    product_id: number;
    name: string;
    conversion_to_base: number;
    barcode: string | null;
    is_base_unit: boolean;
    price_tiers: PriceTier[];
};
type Product = {
    id: number;
    sku: string;
    name: string;
    stock_quantity: number;
    average_cost: number;
    category: { name: string } | null;
    units: Unit[];
};
type CartLine = {
    unit: Unit;
    product: Product;
    quantity: number;
    price: number;
    subtotal: number;
    cost: number;
};
type Receipt = {
    id: number;
    receipt_number: string;
    total_amount: number;
    total_cost: number;
    total_profit: number;
};
type OfflineSale = {
    client_key: string;
    items: { product_unit_id: number; quantity: number }[];
    note: string;
};
const offlineQueueKey = 'rukun-kasir-sales-v1';

function priceFor(unit: Unit, quantity: number): number {
    let price = 0;

    for (const tier of [...unit.price_tiers].sort(
        (left, right) => left.min_qty - right.min_qty,
    )) {
        if (quantity >= tier.min_qty) price = tier.price;
    }

    return price;
}

export default function Pos({ products }: { products: Product[] }) {
    const [cart, setCart] = useState<Record<number, number>>({});
    const [search, setSearch] = useState('');
    const [note, setNote] = useState('');
    const [pendingSales, setPendingSales] = useState<OfflineSale[]>([]);
    const [queueReady, setQueueReady] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncNotice, setSyncNotice] = useState('');
    const [syncedReceipt, setSyncedReceipt] = useState<Receipt | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const { errors, flash } = usePage<{
        errors: Record<string, string>;
        flash: { createdTransaction?: Receipt };
    }>().props;
    const visibleProducts = products.filter((product) =>
        `${product.name} ${product.sku} ${product.units.map((unit) => unit.barcode ?? '').join(' ')}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );
    const cartLines: CartLine[] = products.flatMap((product) =>
        product.units.flatMap((unit) => {
            const quantity = cart[unit.id] ?? 0;
            if (quantity < 1) return [];
            const unitPrice = priceFor(unit, quantity);
            const subtotal = unitPrice * quantity;
            const cost =
                product.average_cost * quantity * unit.conversion_to_base;
            return [
                { unit, product, quantity, price: unitPrice, subtotal, cost },
            ];
        }),
    );
    const totals = cartLines.reduce(
        (sum, line) => ({
            quantity: sum.quantity + line.quantity,
            subtotal: sum.subtotal + line.subtotal,
            cost: sum.cost + line.cost,
        }),
        { quantity: 0, subtotal: 0, cost: 0 },
    );
    const profit = totals.subtotal - totals.cost;

    useEffect(() => {
        const loadQueue = (): OfflineSale[] => {
            try {
                return JSON.parse(
                    localStorage.getItem(offlineQueueKey) ?? '[]',
                ) as OfflineSale[];
            } catch {
                localStorage.removeItem(offlineQueueKey);
                return [];
            }
        };

        const synchronizeQueue = async () => {
            if (!navigator.onLine) return;
            const queue = loadQueue();
            setPendingSales(queue);
            if (queue.length === 0) return;

            setSyncing(true);
            const token = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            )?.content;
            let lastReceipt: Receipt | null = null;

            try {
                while (queue.length > 0 && navigator.onLine) {
                    const response = await fetch(transactionStore.url(), {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                        },
                        body: JSON.stringify(queue[0]),
                    });

                    if (
                        !response.ok ||
                        !response.headers
                            .get('content-type')
                            ?.includes('application/json')
                    )
                        break;

                    lastReceipt = (await response.json()) as Receipt;
                    queue.shift();
                    localStorage.setItem(
                        offlineQueueKey,
                        JSON.stringify(queue),
                    );
                    setPendingSales([...queue]);
                }
            } catch {
                setSyncNotice(
                    'Sinkronisasi tertunda. Pesanan tetap tersimpan di perangkat.',
                );
            } finally {
                setSyncing(false);
            }

            if (lastReceipt) {
                setSyncedReceipt(lastReceipt);
                setSyncNotice(
                    queue.length === 0
                        ? 'Semua pesanan offline sudah tersinkron.'
                        : 'Sebagian pesanan menunggu koneksi.',
                );
                router.reload({ only: ['products'] });
            }
        };

        const onOnline = () => {
            void synchronizeQueue();
        };
        const initialQueue = loadQueue();
        setPendingSales(initialQueue);
        setQueueReady(true);
        window.addEventListener('online', onOnline);
        if (navigator.onLine && initialQueue.length > 0)
            void synchronizeQueue();

        return () => window.removeEventListener('online', onOnline);
    }, []);

    const queuedBaseFor = (productId: number) =>
        pendingSales.reduce((sum, sale) => {
            return (
                sum +
                sale.items.reduce((lineSum, item) => {
                    const unit = products
                        .flatMap((product) => product.units)
                        .find(
                            (candidate) =>
                                candidate.id === item.product_unit_id,
                        );
                    return (
                        lineSum +
                        (unit?.product_id === productId
                            ? item.quantity * unit.conversion_to_base
                            : 0)
                    );
                }, 0)
            );
        }, 0);

    const addUnit = (product: Product, unit: Unit) => {
        const usedBase = cartLines
            .filter((line) => line.product.id === product.id)
            .reduce(
                (sum, line) =>
                    sum + line.quantity * line.unit.conversion_to_base,
                queuedBaseFor(product.id),
            );

        if (usedBase + unit.conversion_to_base > product.stock_quantity) return;
        setCart((current) => ({
            ...current,
            [unit.id]: (current[unit.id] ?? 0) + 1,
        }));
    };

    const changeQuantity = (unit: Unit, delta: number) => {
        const product = products.find((item) => item.id === unit.product_id);
        if (!product) return;
        const nextQuantity = Math.max(0, (cart[unit.id] ?? 0) + delta);
        const usedByOtherUnits = cartLines
            .filter(
                (line) =>
                    line.product.id === product.id && line.unit.id !== unit.id,
            )
            .reduce(
                (sum, line) =>
                    sum + line.quantity * line.unit.conversion_to_base,
                queuedBaseFor(product.id),
            );

        if (
            usedByOtherUnits + nextQuantity * unit.conversion_to_base >
            product.stock_quantity
        )
            return;
        setCart((current) => {
            const next = { ...current };
            if (nextQuantity === 0) delete next[unit.id];
            else next[unit.id] = nextQuantity;
            return next;
        });
    };

    const scanBarcode = () => {
        const code = search.trim();
        const match = products
            .flatMap((product) =>
                product.units.map((unit) => ({ product, unit })),
            )
            .find(
                ({ product, unit }) =>
                    unit.barcode === code || product.sku === code,
            );
        if (match) {
            addUnit(match.product, match.unit);
            setSearch('');
        }
    };

    const submit = () => {
        if (!queueReady || cartLines.length === 0) return;
        const sale: OfflineSale = {
            client_key: crypto.randomUUID(),
            items: cartLines.map((line) => ({
                product_unit_id: line.unit.id,
                quantity: line.quantity,
            })),
            note,
        };

        if (!navigator.onLine) {
            const queue = [...pendingSales, sale];
            localStorage.setItem(offlineQueueKey, JSON.stringify(queue));
            setPendingSales(queue);
            setSyncNotice(
                'Pesanan tersimpan lokal dan akan dikirim saat jaringan kembali.',
            );
            setCart({});
            setNote('');
            return;
        }

        router.post(transactionStore.url(), sale, {
            onSuccess: () => {
                setCart({});
                setNote('');
            },
        });
    };

    const receipt = flash.createdTransaction ?? syncedReceipt;

    return (
        <PosLayout title="Kasir">
            <PageHeading
                eyebrow="TITIK PENJUALAN"
                title="Kasir"
                detail="Cari barang atau scan barcode, lalu selesaikan transaksi."
            />
            {(syncNotice || pendingSales.length > 0 || syncing) && (
                <div
                    role="status"
                    className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-[#e6d9b5] bg-[#fff7e4] px-4 py-3 text-[10px] text-[#836c37]"
                >
                    <span>
                        {syncing
                            ? 'Mengirim pesanan offline ke database...'
                            : syncNotice ||
                              `${pendingSales.length} pesanan menunggu sinkronisasi`}
                    </span>
                    {pendingSales.length > 0 && (
                        <strong>Antrean: {pendingSales.length}</strong>
                    )}
                </div>
            )}
            {receipt && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#cfe1d0] bg-[#eaf4ea] p-4">
                    <div>
                        <p className="text-[11px] font-bold text-[#416a49]">
                            Nota {receipt.receipt_number} tersimpan
                        </p>
                        <p className="mt-1 text-[10px] text-[#56775a]">
                            Total {rupiah(receipt.total_amount)} · HPP{' '}
                            {rupiah(receipt.total_cost)} · Untung{' '}
                            {rupiah(receipt.total_profit)}
                        </p>
                    </div>
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/?text=${encodeURIComponent(`Nota ${receipt.receipt_number}\nTotal: ${rupiah(receipt.total_amount)}\nHPP: ${rupiah(receipt.total_cost)}\nUntung: ${rupiah(receipt.total_profit)}`)}`}
                        className="rounded-[4px] bg-[#28563c] px-3 py-2.5 text-[10px] font-bold text-white"
                    >
                        Kirim nota WhatsApp
                    </a>
                </div>
            )}
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_370px]">
                <section>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    scanBarcode();
                                }
                            }}
                            placeholder="Cari nama, SKU, atau scan barcode..."
                            className="h-11 min-w-[220px] flex-1 rounded-[4px] border border-[#dce6dc] bg-white px-3 text-[12px] outline-none focus:border-[#83a98a]"
                        />
                        <span className="text-[10px] text-[#849087]">
                            {products.length} produk · Enter untuk scan
                        </span>
                    </div>
                    {errors.items && <FormError message={errors.items} />}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                        {visibleProducts.flatMap((product) =>
                            product.units.map((unit) => {
                                const unitPrice = priceFor(unit, 1);
                                const soldBase = cartLines
                                    .filter(
                                        (line) =>
                                            line.product.id === product.id,
                                    )
                                    .reduce(
                                        (sum, line) =>
                                            sum +
                                            line.quantity *
                                                line.unit.conversion_to_base,
                                        0,
                                    );
                                const canAdd =
                                    soldBase +
                                        queuedBaseFor(product.id) +
                                        unit.conversion_to_base <=
                                    product.stock_quantity;
                                return (
                                    <button
                                        key={unit.id}
                                        type="button"
                                        disabled={!canAdd}
                                        onClick={() => addUnit(product, unit)}
                                        className="min-h-[150px] rounded-[5px] border border-[#e0e9e0] bg-white p-3 text-left transition hover:border-[#9cbea0] hover:shadow-[0_5px_18px_rgba(33,67,47,0.07)] disabled:cursor-not-allowed disabled:opacity-45 sm:p-4"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="grid h-9 w-9 place-items-center rounded-[4px] bg-[#f6d990] text-[10px] font-bold text-[#274535]">
                                                {product.sku.slice(0, 2)}
                                            </span>
                                            <span className="rounded-[3px] bg-[#edf4ed] px-1.5 py-1 text-[9px] font-semibold text-[#66816a]">
                                                {product.stock_quantity} dasar
                                            </span>
                                        </div>
                                        <p className="mt-3 min-h-8 text-[11px] leading-snug font-semibold text-[#314837]">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#849087]">
                                            {unit.name} ·{' '}
                                            {unit.conversion_to_base}{' '}
                                            {unit.is_base_unit
                                                ? 'dasar'
                                                : 'per unit dasar'}
                                        </p>
                                        <p className="mt-1 text-[12px] font-bold text-[#254631]">
                                            {rupiah(unitPrice)}
                                        </p>
                                        {unit.price_tiers.some(
                                            (tier) => tier.min_qty > 1,
                                        ) && (
                                            <p className="mt-1 text-[9px] text-[#b6784e]">
                                                Grosir mulai{' '}
                                                {Math.min(
                                                    ...unit.price_tiers
                                                        .filter(
                                                            (tier) =>
                                                                tier.min_qty >
                                                                1,
                                                        )
                                                        .map(
                                                            (tier) =>
                                                                tier.min_qty,
                                                        ),
                                                )}{' '}
                                                unit
                                            </p>
                                        )}
                                    </button>
                                );
                            }),
                        )}
                    </div>
                </section>

                <aside className="sticky top-[82px] rounded-[5px] border border-[#dfe8df] bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between border-b border-[#edf1ed] pb-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-[#264431]">
                                Pesanan
                            </h2>
                            <p className="mt-1 text-[10px] text-[#8a968d]">
                                {totals.quantity} unit dijual
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCart({})}
                            className="text-[10px] font-medium text-[#bb7455]"
                        >
                            Kosongkan
                        </button>
                    </div>
                    <div className="max-h-[330px] min-h-[120px] divide-y divide-[#edf1ed] overflow-y-auto">
                        {cartLines.length ? (
                            cartLines.map((line) => (
                                <div
                                    key={line.unit.id}
                                    className="flex items-center gap-2 py-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[10px] font-semibold text-[#3b5140]">
                                            {line.product.name}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#89958b]">
                                            {line.unit.name} ·{' '}
                                            {rupiah(line.price)} / unit
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeQuantity(line.unit, -1)
                                            }
                                            className="grid h-7 w-7 place-items-center rounded-[3px] border border-[#dce5dc] text-sm"
                                        >
                                            −
                                        </button>
                                        <span className="w-5 text-center text-[10px] font-semibold">
                                            {line.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeQuantity(line.unit, 1)
                                            }
                                            className="grid h-7 w-7 place-items-center rounded-[3px] border border-[#dce5dc] text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="w-[74px] text-right text-[10px] font-semibold">
                                        {rupiah(line.subtotal)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="grid h-[120px] place-items-center text-[11px] text-[#99a39b]">
                                Pilih barang untuk mulai
                            </div>
                        )}
                    </div>
                    <label className="mt-3 block text-[10px] font-semibold text-[#627367]">
                        Catatan transaksi
                        <input
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            className="mt-1.5 h-9 w-full rounded-[3px] border border-[#dfe8df] px-2.5 text-[10px] font-normal outline-none"
                            placeholder="Opsional"
                        />
                    </label>
                    <div className="mt-3 border-t border-[#edf1ed] pt-3">
                        <div className="flex justify-between py-1 text-[10px] text-[#7c8a80]">
                            <span>Subtotal</span>
                            <span>{rupiah(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-[10px] text-[#7c8a80]">
                            <span>Estimasi HPP</span>
                            <span>{rupiah(totals.cost)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-[10px] font-semibold text-[#52805b]">
                            <span>Estimasi profit</span>
                            <span>{rupiah(profit)}</span>
                        </div>
                        <div className="my-3 flex items-center justify-between rounded-[4px] bg-[#f1f6f1] px-3 py-3">
                            <span className="text-[11px] font-semibold text-[#4d6252]">
                                Total bayar
                            </span>
                            <span className="text-[16px] font-bold text-[#1b3f2b]">
                                {rupiah(totals.subtotal)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!queueReady || !cartLines.length}
                            className="h-12 w-full rounded-[4px] bg-[#ed875e] text-[12px] font-bold text-white hover:bg-[#dc754d] disabled:cursor-not-allowed disabled:bg-[#d6ddd6]"
                        >
                            {navigator.onLine
                                ? 'Bayar & simpan ke database'
                                : 'Bayar & antre offline'}
                        </button>
                    </div>
                </aside>
            </div>
        </PosLayout>
    );
}
