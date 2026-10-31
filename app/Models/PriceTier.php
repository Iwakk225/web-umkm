<?php

namespace App\Models;

use Database\Factories\PriceTierFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_unit_id
 * @property int $min_qty
 * @property int $price
 * @property-read ProductUnit $productUnit
 */
#[Fillable(['product_unit_id', 'min_qty', 'price'])]
class PriceTier extends Model
{
    /** @use HasFactory<PriceTierFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['min_qty' => 'integer', 'price' => 'integer'];
    }

    /** @return BelongsTo<ProductUnit, $this> */
    public function productUnit(): BelongsTo
    {
        return $this->belongsTo(ProductUnit::class);
    }
}
