import type { ReactNode } from 'react';

export function PageHeading({
    eyebrow,
    title,
    detail,
    action,
}: {
    eyebrow: string;
    title: string;
    detail: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <p className="mb-1 text-[10px] font-bold tracking-[0.16em] text-[#74867b] uppercase">
                    {eyebrow}
                </p>
                <h1 className="text-[26px] leading-tight font-semibold text-[#183b2a] sm:text-[30px]">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-[#79877e]">{detail}</p>
            </div>
            {action}
        </div>
    );
}

export function Metric({
    label,
    value,
    detail,
    symbol,
    tint,
}: {
    label: string;
    value: string;
    detail: string;
    symbol: string;
    tint: string;
}) {
    return (
        <div className="rounded-[5px] border border-[#e1e9e2] bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-medium text-[#77867b]">
                    {label}
                </p>
                <span
                    className={`grid h-8 w-8 place-items-center rounded-[4px] text-sm font-semibold ${tint}`}
                >
                    {symbol}
                </span>
            </div>
            <p className="mt-4 text-[22px] font-semibold text-[#183b2a] sm:text-[26px]">
                {value}
            </p>
            <p className="mt-1 text-[11px] font-medium text-[#568267]">
                {detail}
            </p>
        </div>
    );
}

export const rupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export function FormError({ message }: { message?: string }) {
    return message ? (
        <p className="mt-1 text-[10px] text-[#bd6347]">{message}</p>
    ) : null;
}

export const fieldClass =
    'mt-1.5 h-10 w-full rounded-[3px] border border-[#dfe8df] bg-white px-3 text-[11px] text-[#304737] outline-none focus:border-[#83a98a]';

export const labelClass = 'block text-[10px] font-semibold text-[#627367]';
