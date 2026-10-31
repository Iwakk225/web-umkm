<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockRequest;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class StockController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render('inventory/index', [
            'products' => Product::query()->with(['category', 'units'])->orderBy('name')->get(),
            'logs' => InventoryLog::query()
                ->with(['product:id,name,sku', 'user:id,name', 'transaction:id,receipt_number'])
                ->latest('id')
                ->paginate(25)
                ->through(fn (InventoryLog $log): array => [
                    'id' => $log->id,
                    'product' => $log->product->name,
                    'sku' => $log->product->sku,
                    'type' => $log->type,
                    'quantity' => $log->quantity,
                    'stock_before' => $log->stock_before,
                    'stock_after' => $log->stock_after,
                    'note' => $log->note,
                    'user' => $log->user?->name,
                    'created_at' => $log->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function store(StoreStockRequest $request, StockService $stockService): RedirectResponse
    {
        $data = $request->validated();
        $unit = ProductUnit::query()->with('product')->findOrFail($request->integer('product_unit_id'));

        if (! $unit->product?->is_active) {
            throw ValidationException::withMessages(['product_unit_id' => 'Produk ini sudah diarsipkan.']);
        }

        $quantityBase = $request->integer('quantity') * $unit->conversion_to_base;
        $unitCostInput = $request->integer('unit_cost');
        $unitCost = intdiv($unitCostInput + intdiv($unit->conversion_to_base, 2), $unit->conversion_to_base);
        $stockService->receive($unit->product_id, $quantityBase, $unitCost, $data['note'] ?? null, $request->user());

        return back()->with('success', 'Stok masuk berhasil disimpan.');
    }

    public function adjust(Request $request, Product $product, StockService $stockService): RedirectResponse
    {
        $data = $request->validate([
            'delta' => ['required', 'integer', 'not_in:0', 'min:-1000000000', 'max:1000000000'],
            'note' => ['required', 'string', 'max:255'],
        ]);

        $stockService->adjust($product->id, $data['delta'], $data['note'], $request->user());

        return back()->with('success', 'Penyesuaian stok berhasil disimpan.');
    }
}
