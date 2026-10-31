<?php

namespace App\Models;

use Database\Factories\TransactionItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $transaction_id
 * @property int|null $product_id
 * @property int|null $product_unit_id
 * @property string $product_name
 * @property string $unit_name
 * @property int $quantity
 * @property int $quantity_base
 * @property int $unit_price
 * @property int $unit_cost_per_base
 * @property int $subtotal
 * @property int $cost_total
 * @property int $profit
 * @property-read Transaction $transaction
 * @property-read Product|null $product
 * @property-read ProductUnit|null $productUnit
 */
#[Fillable(['transaction_id', 'product_id', 'product_unit_id', 'product_name', 'unit_name', 'quantity', 'quantity_base', 'unit_price', 'unit_cost_per_base', 'subtotal', 'cost_total', 'profit'])]
class TransactionItem extends Model
{
    /** @use HasFactory<TransactionItemFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'quantity_base' => 'integer',
            'unit_price' => 'integer',
            'unit_cost_per_base' => 'integer',
            'subtotal' => 'integer',
            'cost_total' => 'integer',
            'profit' => 'integer',
        ];
    }

    /** @return BelongsTo<Transaction, $this> */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<ProductUnit, $this> */
    public function productUnit(): BelongsTo
    {
        return $this->belongsTo(ProductUnit::class);
    }
}
