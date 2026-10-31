import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { dashboard, logout } from '@/routes';
import { index as categoriesRoute } from '@/routes/categories';
import { index as deliveriesRoute } from '@/routes/pengiriman';
import { index as inventoryRoute } from '@/routes/stock';
import { index as posRoute } from '@/routes/pos';
import { index as productsRoute } from '@/routes/products';
import { index as reportsRoute } from '@/routes/reports';
import { index as transactionsRoute } from '@/routes/transactions';
import { index as usersRoute } from '@/routes/users';

type PosLayoutProps = PropsWithChildren<{ title: string }>;

const navigation = [
    { label: 'Ringkasan', icon: '⌂', href: dashboard(), roles: ['admin'] },
    { label: 'Kasir', icon: '▦', href: posRoute(), roles: ['admin', 'kasir'] },
    { label: 'Stok', icon: '⇄', href: inventoryRoute(), roles: ['admin'] },
    { label: 'Produk', icon: '▣', href: productsRoute(), roles: ['admin'] },
    { label: 'Kategori', icon: '▤', href: categoriesRoute(), roles: ['admin'] },
    { label: 'Laporan', icon: '▥', href: reportsRoute(), roles: ['admin'] },
    {
        label: 'Transaksi',
        icon: '▧',
        href: transactionsRoute(),
        roles: ['admin', 'kasir'],
    },
    {
        label: 'Pengiriman',
        icon: '⌁',
        href: deliveriesRoute(),
        roles: ['admin'],
    },
    { label: 'Akun kasir', icon: '♙', href: usersRoute(), roles: ['admin'] },
];

export default function PosLayout({ title, children }: PosLayoutProps) {
    const page = usePage<{
        auth: { user: { name: string; role: 'admin' | 'kasir' } };
        flash: { success?: string };
    }>();
    const { auth, flash } = page.props;
    const url = page.url;
    const [online, setOnline] = useState(true);
    const visibleNavigation = navigation.filter((item) =>
        item.roles.includes(auth.user.role),
    );

    useEffect(() => {
        const updateConnection = () => setOnline(navigator.onLine);
        updateConnection();
        window.addEventListener('online', updateConnection);
        window.addEventListener('offline', updateConnection);

        return () => {
            window.removeEventListener('online', updateConnection);
            window.removeEventListener('offline', updateConnection);
        };
    }, []);

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-[#f2f6f2] text-[#1d3326]">
                <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col bg-[#173d2b] px-4 py-5 text-white xl:flex">
                    <Link
                        href={dashboard()}
                        className="mb-8 flex items-center gap-3 px-2"
                    >
                        <span className="grid h-10 w-10 place-items-center rounded-[4px] bg-[#f4c95d] text-lg font-black text-[#173d2b]">
                            R
                        </span>
                        <span>
                            <span className="block text-[15px] font-semibold">
                                RukunKasir
                            </span>
                            <span className="mt-0.5 block text-[10px] text-[#b6c9bc]">
                                TOKO KELONTONG
                            </span>
                        </span>
                    </Link>
                    <p className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em] text-[#91aa99] uppercase">
                        Menu utama
                    </p>
                    <nav className="flex flex-col gap-1">
                        {visibleNavigation.map((item) => {
                            const active =
                                url === item.href.url ||
                                url.startsWith(`${item.href.url}?`);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex h-11 items-center gap-3 rounded-[4px] px-3 text-[13px] font-medium transition ${active ? 'bg-[#28563c] text-white ring-1 ring-[#f4c95d]' : 'text-[#c0d1c5] hover:bg-[#214a34]'}`}
                                >
                                    <span
                                        className={`grid h-6 w-6 place-items-center text-base ${active ? 'text-[#f4c95d]' : 'text-[#96b39e]'}`}
                                    >
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto rounded-[4px] border border-[#42634d] bg-[#204932] p-3.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span>{online ? 'Terhubung' : 'Mode offline'}</span>
                            <span
                                className={`h-2 w-2 rounded-full ${online ? 'bg-[#8ac58b]' : 'bg-[#f4c95d]'}`}
                            />
                        </div>
                        <p className="mt-2 text-[10px] leading-relaxed text-[#b7cabe]">
                            {online
                                ? 'Data tersimpan ke database.'
                                : 'Transaksi lokal akan disinkronkan saat online.'}
                        </p>
                    </div>
                </aside>

                <div className="xl:pl-[232px]">
                    <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-[#e0e8e0] bg-[#f7f9f6]/95 px-4 backdrop-blur sm:px-7">
                        <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-[4px] bg-[#173d2b] text-sm font-black text-[#f4c95d] xl:hidden">
                                R
                            </span>
                            <div>
                                <p className="text-[12px] font-semibold text-[#294333]">
                                    Warung Rukun
                                </p>
                                <p className="text-[10px] text-[#829087]">
                                    Operasional toko
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:flex ${online ? 'bg-[#e5f1e6] text-[#497653]' : 'bg-[#fff1d2] text-[#966d17]'}`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-[#6ca977]' : 'bg-[#dfa938]'}`}
                                />
                                {online ? 'Online' : 'Offline'}
                            </span>
                            <span className="hidden text-right sm:block">
                                <span className="block text-[11px] font-semibold text-[#354b3b]">
                                    {auth.user.name}
                                </span>
                                <span className="block text-[9px] text-[#879389]">
                                    {auth.user.role === 'admin'
                                        ? 'Pemilik'
                                        : 'Kasir'}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={() => router.post(logout.url())}
                                className="rounded-[4px] border border-[#dce6dc] bg-white px-3 py-2 text-[10px] font-semibold text-[#5d7061] hover:bg-[#f2f6f2]"
                            >
                                Keluar
                            </button>
                        </div>
                    </header>

                    <nav className="flex gap-1 overflow-x-auto border-b border-[#e2e9e2] bg-[#f7f9f6] px-3 py-2 xl:hidden">
                        {visibleNavigation.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`shrink-0 rounded-[3px] px-3 py-2 text-[11px] font-semibold ${url === item.href.url ? 'bg-[#173d2b] text-white' : 'text-[#68796d]'}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8">
                        {flash.success && (
                            <div
                                role="status"
                                className="mb-5 rounded-[4px] border border-[#cfe1d0] bg-[#eaf4ea] px-4 py-3 text-[12px] font-medium text-[#416a49]"
                            >
                                {flash.success}
                            </div>
                        )}
                        {children}
                    </main>
                    <footer className="border-t border-[#e2e9e2] px-4 py-4 text-center text-[9px] text-[#929d94]">
                        RukunKasir · Operasional toko lebih tertata, setiap
                        hari.
                    </footer>
                </div>
            </div>
        </>
    );
}
