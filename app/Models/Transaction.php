<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $receipt_number
 * @property string|null $client_key
 * @property int|null $user_id
 * @property int $total_amount
 * @property int $total_cost
 * @property int $total_profit
 * @property string $status
 * @property-read User|null $user
 * @property-read Collection<int, TransactionItem> $items
 * @property-read Collection<int, InventoryLog> $inventoryLogs
 * @property-read int|string $sales
 * @property-read int|string $cost
 * @property-read int|string $profit
 * @property-read int|string $count
 */
#[Fillable(['receipt_number', 'client_key', 'user_id', 'total_amount', 'total_cost', 'total_profit', 'status', 'note'])]
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'total_cost' => 'integer',
            'total_profit' => 'integer',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<TransactionItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /** @return HasMany<InventoryLog, $this> */
    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}
