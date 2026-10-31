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
    destroy as deleteDelivery,
    store as storeDelivery,
    update as updateDelivery,
} from '@/routes/pengiriman';

type Delivery = {
    id: number;
    recipient: string;
    destination: string;
    package_length_cm: number;
    package_width_cm: number;
    package_height_cm: number;
    package_count: number;
    actual_weight_grams: number;
    volume_cm3: number;
    volumetric_weight_grams: number;
    recommended_vehicle: string;
    status: string;
    note: string | null;
    created_at: string;
};

type FormData = {
    recipient: string;
    destination: string;
    package_length_cm: string;
    package_width_cm: string;
    package_height_cm: string;
    package_count: string;
    actual_weight_kg: string;
    status: string;
    note: string;
};

const emptyForm: FormData = {
    recipient: '',
    destination: '',
    package_length_cm: '40',
    package_width_cm: '30',
    package_height_cm: '25',
    package_count: '1',
    actual_weight_kg: '1.7',
    status: 'draft',
    note: '',
};

export default function Deliveries({
    deliveries,
}: {
    deliveries: { data: Delivery[] };
}) {
    const [editing, setEditing] = useState<Delivery | null>(null);
    const form = useForm<FormData>(emptyForm);
    const length = Number(form.data.package_length_cm) || 0;
    const width = Number(form.data.package_width_cm) || 0;
    const height = Number(form.data.package_height_cm) || 0;
    const packageCount = Number(form.data.package_count) || 0;
    const volume = length * width * height * packageCount;
    const volumetricWeightGrams =
        Math.ceil((length * width * height) / 6) * packageCount;
    const actualWeightGrams =
        Math.round((Number(form.data.actual_weight_kg) || 0) * 1000) *
        packageCount;
    const recommendedVehicle = volume >= 2_000_000 ? 'Truk engkel' : 'Pickup';

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.put(updateDelivery.url(editing.id), {
                onSuccess: () => {
                    setEditing(null);
                    form.reset();
                },
            });
        } else {
            form.post(storeDelivery.url(), { onSuccess: () => form.reset() });
        }
    };

    const beginEdit = (delivery: Delivery) => {
        setEditing(delivery);
        form.setData({
            recipient: delivery.recipient,
            destination: delivery.destination,
            package_length_cm: String(delivery.package_length_cm),
            package_width_cm: String(delivery.package_width_cm),
            package_height_cm: String(delivery.package_height_cm),
            package_count: String(delivery.package_count),
            actual_weight_kg: String(delivery.actual_weight_grams / 1000),
            status: delivery.status,
            note: delivery.note ?? '',
        });
    };

    const cancelEdit = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
    };

    return (
        <PosLayout title="Pengiriman">
            <PageHeading
                eyebrow="KALKULATOR LOGISTIK"
                title="Pengiriman"
                detail="Simpan tujuan, ukuran, dan rekomendasi kendaraan setiap kiriman."
            />
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
                <form
                    onSubmit={submit}
                    className="rounded-[5px] border border-[#e1e9e2] bg-white p-5 sm:p-6"
                >
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-semibold text-[#24412f]">
                                {editing
                                    ? 'Ubah pengiriman'
                                    : 'Buat pengiriman'}
                            </h2>
                            <p className="mt-1 text-[11px] text-[#849087]">
                                Perhitungan volume disimpan bersama data
                                pengiriman.
                            </p>
                        </div>
                        {editing && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-[10px] font-semibold text-[#bd7455]"
                            >
                                Batal ubah
                            </button>
                        )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className={labelClass}>
                            Penerima
                            <input
                                required
                                className={fieldClass}
                                value={form.data.recipient}
                                onChange={(event) =>
                                    form.setData(
                                        'recipient',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.recipient && (
                                <FormError message={form.errors.recipient} />
                            )}
                        </label>
                        <label className={labelClass}>
                            Tujuan pengiriman
                            <input
                                required
                                className={fieldClass}
                                value={form.data.destination}
                                onChange={(event) =>
                                    form.setData(
                                        'destination',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.destination && (
                                <FormError message={form.errors.destination} />
                            )}
                        </label>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {(
                            [
                                ['package_length_cm', 'Panjang (cm)'],
                                ['package_width_cm', 'Lebar (cm)'],
                                ['package_height_cm', 'Tinggi (cm)'],
                            ] as const
                        ).map(([key, label]) => (
                            <label key={key} className={labelClass}>
                                {label}
                                <input
                                    required
                                    min="1"
                                    type="number"
                                    className={fieldClass}
                                    value={form.data[key]}
                                    onChange={(event) =>
                                        form.setData(key, event.target.value)
                                    }
                                />
                                {form.errors[key] && (
                                    <FormError message={form.errors[key]} />
                                )}
                            </label>
                        ))}
                        <label className={labelClass}>
                            Jumlah koli
                            <input
                                required
                                min="1"
                                type="number"
                                className={fieldClass}
                                value={form.data.package_count}
                                onChange={(event) =>
                                    form.setData(
                                        'package_count',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                        <label className={labelClass}>
                            Berat aktual / koli (kg)
                            <input
                                required
                                min="0"
                                step="0.1"
                                type="number"
                                className={fieldClass}
                                value={form.data.actual_weight_kg}
                                onChange={(event) =>
                                    form.setData(
                                        'actual_weight_kg',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                        {editing && (
                            <label className={labelClass}>
                                Status
                                <select
                                    className={fieldClass}
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {[
                                        'draft',
                                        'ready',
                                        'sent',
                                        'delivered',
                                    ].map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                    <label className={`${labelClass} mt-4`}>
                        Catatan
                        <textarea
                            rows={2}
                            className="mt-1.5 w-full rounded-[3px] border border-[#dfe8df] bg-white px-3 py-2 text-[11px] outline-none focus:border-[#83a98a]"
                            value={form.data.note}
                            onChange={(event) =>
                                form.setData('note', event.target.value)
                            }
                        />
                    </label>
                    <FormError message={form.errors.actual_weight_kg} />
                    <button
                        disabled={form.processing}
                        className="mt-5 h-11 w-full rounded-[4px] bg-[#28563c] text-[11px] font-bold text-white disabled:opacity-50"
                    >
                        {editing ? 'Simpan perubahan' : 'Simpan pengiriman'}
                    </button>
                </form>

                <section className="rounded-[5px] bg-[#173d2b] p-5 text-white sm:p-6">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#a9c5ae] uppercase">
                        REKOMENDASI KENDARAAN
                    </p>
                    <h2 className="mt-3 text-[23px] font-semibold">
                        {recommendedVehicle}
                    </h2>
                    <p className="mt-1 text-[11px] text-[#c0d1c5]">
                        Dihitung dari volume total {packageCount} koli.
                    </p>
                    <div className="my-5 h-px bg-[#42634d]" />
                    <div className="space-y-3 text-[11px]">
                        <div className="flex justify-between">
                            <span className="text-[#bfd0c3]">Volume total</span>
                            <strong>
                                {(volume / 1_000_000).toLocaleString('id-ID', {
                                    maximumFractionDigits: 2,
                                })}{' '}
                                m³
                            </strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#bfd0c3]">
                                Berat volumetrik
                            </span>
                            <strong>
                                {(volumetricWeightGrams / 1000).toLocaleString(
                                    'id-ID',
                                    { maximumFractionDigits: 1 },
                                )}{' '}
                                kg
                            </strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#bfd0c3]">Berat aktual</span>
                            <strong>
                                {(actualWeightGrams / 1000).toLocaleString(
                                    'id-ID',
                                    { maximumFractionDigits: 1 },
                                )}{' '}
                                kg
                            </strong>
                        </div>
                        <div className="flex justify-between border-t border-[#42634d] pt-3">
                            <span className="text-[#bfd0c3]">
                                Berat tertagih
                            </span>
                            <strong className="text-[#f4c95d]">
                                {(
                                    Math.max(
                                        volumetricWeightGrams,
                                        actualWeightGrams,
                                    ) / 1000
                                ).toLocaleString('id-ID', {
                                    maximumFractionDigits: 1,
                                })}{' '}
                                kg
                            </strong>
                        </div>
                    </div>
                    <p className="mt-5 rounded-[4px] bg-[#28563c] p-3 text-[10px] leading-relaxed text-[#d2e1d4]">
                        Volume di atas 2 m³ disarankan menggunakan truk engkel.
                    </p>
                </section>
            </div>

            <section className="mt-5 overflow-hidden rounded-[5px] border border-[#e1e9e2] bg-white">
                <div className="border-b border-[#e8eee8] p-4">
                    <h2 className="text-[14px] font-semibold text-[#294634]">
                        Daftar pengiriman
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                        <thead className="bg-[#f7f9f6] text-[9px] font-bold tracking-[0.1em] text-[#89968c] uppercase">
                            <tr>
                                <th className="px-4 py-3">Penerima / tujuan</th>
                                <th className="px-3 py-3">Koli & volume</th>
                                <th className="px-3 py-3">Kendaraan</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf1ed]">
                            {deliveries.data.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td className="px-4 py-3">
                                        <p className="text-[10px] font-semibold">
                                            {delivery.recipient}
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#849087]">
                                            {delivery.destination}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3 text-[10px]">
                                        {delivery.package_count} koli ·{' '}
                                        {(
                                            delivery.volume_cm3 / 1_000_000
                                        ).toLocaleString('id-ID')}{' '}
                                        m³
                                    </td>
                                    <td className="px-3 py-3 text-[10px]">
                                        {delivery.recommended_vehicle}
                                    </td>
                                    <td className="px-3 py-3 text-[10px]">
                                        {delivery.status}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    beginEdit(delivery)
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
                                                            'Hapus data pengiriman ini?',
                                                        )
                                                    )
                                                        router.delete(
                                                            deleteDelivery.url(
                                                                delivery.id,
                                                            ),
                                                        );
                                                }}
                                                className="text-[9px] font-semibold text-[#bb7455]"
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
        </PosLayout>
    );
}
