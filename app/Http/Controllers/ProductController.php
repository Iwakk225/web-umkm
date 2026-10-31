<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('products/index', [
            'products' => Product::query()
                ->with(['category', 'units.priceTiers'])
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('units', fn ($units) => $units->where('barcode', $search));
                }))
                ->orderBy('name')
                ->get(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $product = Product::create([
                'category_id' => $data['category_id'] ?? null,
                'sku' => $data['sku'],
                'name' => $data['name'],
                'low_stock_threshold' => $data['low_stock_threshold'],
                'stock_quantity' => 0,
                'average_cost' => 0,
            ]);

            $this->saveUnitsAndPrices($product, $data);
        });

        return back()->with('success', 'Produk berhasil ditambahkan. Catat stok masuk untuk mulai menjual.');
    }

    /**
     * Display the specified resource.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $product): void {
            $product->update([
                'category_id' => $data['category_id'] ?? null,
                'sku' => $data['sku'],
                'name' => $data['name'],
                'low_stock_threshold' => $data['low_stock_threshold'],
            ]);

            $this->saveUnitsAndPrices($product, $data);
        });

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Produk diarsipkan. Riwayat transaksi tetap tersimpan.');
    }

    /** @param array<string, mixed> $data */
    private function saveUnitsAndPrices(Product $product, array $data): void
    {
        $baseUnit = $product->units()->where('is_base_unit', true)->first();

        if (! $baseUnit) {
            $baseUnit = $product->units()->create([
                'name' => $data['base_unit'],
                'conversion_to_base' => 1,
                'barcode' => $data['base_barcode'] ?? null,
                'is_base_unit' => true,
            ]);
        } else {
            $baseUnit->update([
                'name' => $data['base_unit'],
                'barcode' => $data['base_barcode'] ?? null,
            ]);
        }

        $baseUnit->priceTiers()->updateOrCreate(
            ['min_qty' => 1],
            ['price' => $data['base_price']],
        );
        $this->saveWholesaleTier($baseUnit, $data['wholesale_min_qty'] ?? null, $data['wholesale_price'] ?? null);

        if (($data['pack_unit'] ?? '') !== '') {
            $packUnit = $product->units()->where('is_base_unit', false)->first();

            if (! $packUnit) {
                $packUnit = $product->units()->create([
                    'name' => $data['pack_unit'],
                    'conversion_to_base' => $data['pack_conversion'],
                    'barcode' => $data['pack_barcode'] ?? null,
                    'is_base_unit' => false,
                ]);
            } else {
                $packUnit->update([
                    'name' => $data['pack_unit'],
                    'conversion_to_base' => $data['pack_conversion'],
                    'barcode' => $data['pack_barcode'] ?? null,
                ]);
            }

            $packUnit->priceTiers()->updateOrCreate(
                ['min_qty' => 1],
                ['price' => $data['pack_price']],
            );
            $this->saveWholesaleTier($packUnit, $data['pack_wholesale_min_qty'] ?? null, $data['pack_wholesale_price'] ?? null);
        }
    }

    private function saveWholesaleTier(ProductUnit $unit, ?int $minimum, ?int $price): void
    {
        if ($minimum !== null && $price !== null) {
            $unit->priceTiers()->updateOrCreate(['min_qty' => $minimum], ['price' => $price]);
            $unit->priceTiers()->where('min_qty', '>', 1)->where('min_qty', '!=', $minimum)->delete();

            return;
        }

        $unit->priceTiers()->where('min_qty', '>', 1)->delete();
    }
}
