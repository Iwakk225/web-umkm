<?php

namespace App\Models;

use Database\Factories\ProductUnitFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property int $conversion_to_base
 * @property string|null $barcode
 * @property bool $is_base_unit
 * @property-read Product|null $product
 * @property-read Collection<int, PriceTier> $priceTiers
 */
#[Fillable(['product_id', 'name', 'conversion_to_base', 'barcode', 'is_base_unit'])]
class ProductUnit extends Model
{
    /** @use HasFactory<ProductUnitFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'conversion_to_base' => 'integer',
            'is_base_unit' => 'boolean',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return HasMany<PriceTier, $this> */
    public function priceTiers(): HasMany
    {
        return $this->hasMany(PriceTier::class)->orderBy('min_qty');
    }
}
