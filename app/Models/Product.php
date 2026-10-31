<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int|null $category_id
 * @property string $sku
 * @property string $name
 * @property int $stock_quantity
 * @property int $low_stock_threshold
 * @property int $average_cost
 * @property bool $is_active
 * @property-read Category|null $category
 * @property-read Collection<int, ProductUnit> $units
 * @property-read Collection<int, InventoryLog> $inventoryLogs
 * @property-read Collection<int, TransactionItem> $transactionItems
 */
#[Fillable(['category_id', 'sku', 'name', 'stock_quantity', 'low_stock_threshold', 'average_cost', 'is_active'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'average_cost' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<ProductUnit, $this> */
    public function units(): HasMany
    {
        return $this->hasMany(ProductUnit::class);
    }

    /** @return HasMany<InventoryLog, $this> */
    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    /** @return HasMany<TransactionItem, $this> */
    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
