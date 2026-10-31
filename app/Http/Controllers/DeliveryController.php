<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDeliveryRequest;
use App\Http\Requests\UpdateDeliveryRequest;
use App\Models\Delivery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('deliveries/index', [
            'deliveries' => Delivery::query()->with('user:id,name')->latest('id')->paginate(20),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDeliveryRequest $request): RedirectResponse
    {
        Delivery::create($this->deliveryAttributes($request->validated()) + [
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Pengiriman berhasil disimpan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDeliveryRequest $request, Delivery $delivery): RedirectResponse
    {
        $delivery->update($this->deliveryAttributes($request->validated()));

        return back()->with('success', 'Pengiriman berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Delivery $delivery): RedirectResponse
    {
        $delivery->delete();

        return back()->with('success', 'Pengiriman berhasil dihapus.');
    }

    /** @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function deliveryAttributes(array $data): array
    {
        $length = (int) $data['package_length_cm'];
        $width = (int) $data['package_width_cm'];
        $height = (int) $data['package_height_cm'];
        $count = (int) $data['package_count'];
        $packageVolume = $length * $width * $height;
        $volume = $packageVolume * $count;
        $volumetricWeight = intdiv($packageVolume + 5, 6) * $count;

        return [
            ...Arr::only($data, ['recipient', 'destination', 'package_length_cm', 'package_width_cm', 'package_height_cm', 'package_count', 'status', 'note']),
            'actual_weight_grams' => (int) round((float) $data['actual_weight_kg'] * 1000),
            'volume_cm3' => $volume,
            'volumetric_weight_grams' => $volumetricWeight,
            'recommended_vehicle' => $volume >= 2_000_000 ? 'Truk engkel' : 'Pickup',
        ];
    }
}
