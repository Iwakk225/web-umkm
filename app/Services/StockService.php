<?php

namespace App\Services;

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function receive(
        int $productId,
        int $quantityBase,
        int $unitCost,
        ?string $note,
        ?User $user,
        ?Transaction $transaction = null,
    ): InventoryLog {
        if ($quantityBase < 1 || $unitCost < 0) {
            throw ValidationException::withMessages(['quantity' => 'Jumlah dan harga pokok tidak valid.']);
        }

        return DB::transaction(function () use ($productId, $quantityBase, $unitCost, $note, $user, $transaction): InventoryLog {
            $product = Product::query()->lockForUpdate()->findOrFail($productId);
            $stockBefore = $product->stock_quantity;
            $stockAfter = $stockBefore + $quantityBase;
            $inventoryValue = ($stockBefore * $product->average_cost) + ($quantityBase * $unitCost);

            $product->update([
                'stock_quantity' => $stockAfter,
                'average_cost' => intdiv($inventoryValue + intdiv($stockAfter, 2), $stockAfter),
            ]);

            return InventoryLog::create([
                'product_id' => $product->id,
                'transaction_id' => $transaction?->id,
                'user_id' => $user?->id,
                'type' => 'masuk',
                'quantity' => $quantityBase,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'unit_cost' => $unitCost,
                'note' => $note,
            ]);
        });
    }

    public function adjust(int $productId, int $delta, ?string $note, ?User $user): InventoryLog
    {
        if ($delta === 0) {
            throw ValidationException::withMessages(['quantity' => 'Perubahan stok tidak boleh nol.']);
        }

        return DB::transaction(function () use ($productId, $delta, $note, $user): InventoryLog {
            $product = Product::query()->lockForUpdate()->findOrFail($productId);
            $stockBefore = $product->stock_quantity;
            $stockAfter = $stockBefore + $delta;

            if ($stockAfter < 0) {
                throw ValidationException::withMessages(['quantity' => 'Stok tidak boleh kurang dari nol.']);
            }

            $product->update(['stock_quantity' => $stockAfter]);

            return InventoryLog::create([
                'product_id' => $product->id,
                'user_id' => $user?->id,
                'type' => 'penyesuaian',
                'quantity' => abs($delta),
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'unit_cost' => $product->average_cost,
                'note' => $note,
            ]);
        });
    }

    public function consume(int $productId, int $quantityBase, Transaction $transaction, ?User $user): int
    {
        if ($quantityBase < 1) {
            throw ValidationException::withMessages(['quantity' => 'Jumlah barang harus lebih dari nol.']);
        }

        return DB::transaction(function () use ($productId, $quantityBase, $transaction, $user): int {
            $product = Product::query()->lockForUpdate()->findOrFail($productId);

            if ($product->stock_quantity < $quantityBase) {
                throw ValidationException::withMessages([
                    'items' => "Stok {$product->name} tidak mencukupi.",
                ]);
            }

            $stockBefore = $product->stock_quantity;
            $product->update(['stock_quantity' => $stockBefore - $quantityBase]);

            InventoryLog::create([
                'product_id' => $product->id,
                'transaction_id' => $transaction->id,
                'user_id' => $user?->id,
                'type' => 'keluar',
                'quantity' => $quantityBase,
                'stock_before' => $stockBefore,
                'stock_after' => $product->stock_quantity,
                'unit_cost' => $product->average_cost,
                'note' => "Penjualan {$transaction->receipt_number}",
            ]);

            return $product->average_cost;
        });
    }
}
