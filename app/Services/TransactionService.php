<?php

namespace App\Services;

use App\Models\ProductUnit;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function __construct(private StockService $stockService) {}

    /**
     * @param  array<int, array{product_unit_id: int, quantity: int}>  $items
     */
    public function checkout(?User $user, array $items, ?string $note = null, ?string $clientKey = null): Transaction
    {
        $quantities = collect($items)
            ->groupBy('product_unit_id')
            ->map(fn ($rows) => (int) $rows->sum('quantity'));

        return DB::transaction(function () use ($user, $quantities, $note, $clientKey): Transaction {
            if ($clientKey !== null) {
                $existing = Transaction::query()
                    ->where('client_key', $clientKey)
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    return $existing->load('items');
                }
            }

            $transaction = Transaction::create([
                'receipt_number' => 'TRX-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'client_key' => $clientKey,
                'user_id' => $user?->id,
                'total_amount' => 0,
                'total_cost' => 0,
                'total_profit' => 0,
                'status' => 'paid',
                'note' => $note,
            ]);

            $totalAmount = 0;
            $totalCost = 0;

            foreach ($quantities as $unitId => $quantity) {
                $unit = ProductUnit::query()
                    ->with('product')
                    ->whereKey($unitId)
                    ->firstOrFail();
                $product = $unit->product;

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages(['items' => 'Produk ini sudah tidak tersedia.']);
                }

                $tier = $unit->priceTiers()
                    ->where('min_qty', '<=', $quantity)
                    ->reorder()
                    ->orderByDesc('min_qty')
                    ->first();

                if (! $tier) {
                    throw ValidationException::withMessages(['items' => 'Harga produk belum diatur.']);
                }

                $quantityBase = $quantity * $unit->conversion_to_base;
                $unitCost = $this->stockService->consume($product->id, $quantityBase, $transaction, $user);
                $subtotal = $quantity * $tier->price;
                $costTotal = $quantityBase * $unitCost;

                $transaction->items()->create([
                    'product_id' => $product->id,
                    'product_unit_id' => $unit->id,
                    'product_name' => $product->name,
                    'unit_name' => $unit->name,
                    'quantity' => $quantity,
                    'quantity_base' => $quantityBase,
                    'unit_price' => $tier->price,
                    'unit_cost_per_base' => $unitCost,
                    'subtotal' => $subtotal,
                    'cost_total' => $costTotal,
                    'profit' => $subtotal - $costTotal,
                ]);

                $totalAmount += $subtotal;
                $totalCost += $costTotal;
            }

            $transaction->update([
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'total_profit' => $totalAmount - $totalCost,
            ]);

            return $transaction->load('items');
        });
    }

    public function void(Transaction $transaction, User $user): Transaction
    {
        return DB::transaction(function () use ($transaction, $user): Transaction {
            $locked = Transaction::query()->lockForUpdate()->with('items')->findOrFail($transaction->id);

            if ($locked->status !== 'paid') {
                throw ValidationException::withMessages(['transaction' => 'Transaksi ini sudah dibatalkan.']);
            }

            foreach ($locked->items as $item) {
                if ($item->product_id !== null) {
                    $this->stockService->receive(
                        $item->product_id,
                        $item->quantity_base,
                        $item->unit_cost_per_base,
                        "Pembatalan {$locked->receipt_number}",
                        $user,
                        $locked,
                    );
                }
            }

            $locked->update(['status' => 'voided']);

            return $locked;
        });
    }
}
