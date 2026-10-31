<?php

namespace App\Models;

use Database\Factories\InventoryLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $transaction_id
 * @property int|null $user_id
 * @property string $type
 * @property int $quantity
 * @property int $stock_before
 * @property int $stock_after
 * @property int $unit_cost
 * @property-read Product $product
 * @property-read Transaction|null $transaction
 * @property-read User|null $user
 */
#[Fillable(['product_id', 'transaction_id', 'user_id', 'type', 'quantity', 'stock_before', 'stock_after', 'unit_cost', 'note'])]
class InventoryLog extends Model
{
    /** @use HasFactory<InventoryLogFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'stock_before' => 'integer',
            'stock_after' => 'integer',
            'unit_cost' => 'integer',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    /** @return BelongsTo<Transaction, $this> */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
