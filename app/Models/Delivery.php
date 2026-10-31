<?php

namespace App\Models;

use Database\Factories\DeliveryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $recipient
 * @property string $destination
 * @property int $package_length_cm
 * @property int $package_width_cm
 * @property int $package_height_cm
 * @property int $package_count
 * @property int $actual_weight_grams
 * @property int $volume_cm3
 * @property int $volumetric_weight_grams
 * @property string $recommended_vehicle
 * @property string $status
 * @property-read User|null $user
 */
#[Fillable(['user_id', 'recipient', 'destination', 'package_length_cm', 'package_width_cm', 'package_height_cm', 'package_count', 'actual_weight_grams', 'volume_cm3', 'volumetric_weight_grams', 'recommended_vehicle', 'status', 'note'])]
class Delivery extends Model
{
    /** @use HasFactory<DeliveryFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'package_length_cm' => 'integer',
            'package_width_cm' => 'integer',
            'package_height_cm' => 'integer',
            'package_count' => 'integer',
            'actual_weight_grams' => 'integer',
            'volume_cm3' => 'integer',
            'volumetric_weight_grams' => 'integer',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
