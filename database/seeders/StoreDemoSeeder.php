<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Services\StockService;
use App\Services\TransactionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StoreDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(StockService $stockService, TransactionService $transactionService): void
    {
        if (Product::query()->exists()) {
            return;
        }

        $definitions = [
            ['sku' => 'BR-001', 'name' => 'Beras Setra Ramos', 'category' => 'Sembako', 'base' => 'gram', 'pack' => 'bal', 'conversion' => 5000, 'base_price' => 11, 'pack_price' => 55000, 'wholesale_price' => 50000, 'cost' => 8, 'threshold' => 50000, 'closing_stock' => 25000],
            ['sku' => 'MG-001', 'name' => 'Minyak Goreng Kita', 'category' => 'Sembako', 'base' => 'ml', 'pack' => 'botol', 'conversion' => 1000, 'base_price' => 19, 'pack_price' => 19000, 'wholesale_price' => 17500, 'cost' => 14, 'threshold' => 10000, 'closing_stock' => 18000],
            ['sku' => 'GP-001', 'name' => 'Gula Pasir Gulaku', 'category' => 'Sembako', 'base' => 'gram', 'pack' => 'kg', 'conversion' => 1000, 'base_price' => 18, 'pack_price' => 18000, 'wholesale_price' => 16500, 'cost' => 14, 'threshold' => 12000, 'closing_stock' => 8000],
            ['sku' => 'TT-001', 'name' => 'Tepung Terigu Segitiga', 'category' => 'Sembako', 'base' => 'gram', 'pack' => 'karung', 'conversion' => 25000, 'base_price' => 12, 'pack_price' => 300000, 'wholesale_price' => 280000, 'cost' => 10, 'threshold' => 150000, 'closing_stock' => 250000],
            ['sku' => 'MI-001', 'name' => 'Mi Instan Goreng', 'category' => 'Makanan', 'base' => 'pcs', 'pack' => 'dus', 'conversion' => 40, 'base_price' => 5000, 'pack_price' => 112000, 'wholesale_price' => 105000, 'cost' => 4000, 'threshold' => 240, 'closing_stock' => 120],
            ['sku' => 'TL-001', 'name' => 'Telur Ayam Negeri', 'category' => 'Sembako', 'base' => 'pcs', 'pack' => 'peti', 'conversion' => 30, 'base_price' => 2600, 'pack_price' => 78000, 'wholesale_price' => 72000, 'cost' => 2100, 'threshold' => 120, 'closing_stock' => 90],
            ['sku' => 'KP-001', 'name' => 'Kopi Kapal Api', 'category' => 'Minuman', 'base' => 'sachet', 'pack' => 'box', 'conversion' => 10, 'base_price' => 2500, 'pack_price' => 25000, 'wholesale_price' => 23000, 'cost' => 1800, 'threshold' => 100, 'closing_stock' => 200],
            ['sku' => 'SB-001', 'name' => 'Sabun Cuci Piring', 'category' => 'Kebersihan', 'base' => 'ml', 'pack' => 'dus', 'conversion' => 6000, 'base_price' => 3, 'pack_price' => 18000, 'wholesale_price' => 16500, 'cost' => 2, 'threshold' => 60000, 'closing_stock' => 120000],
        ];

        $categories = collect($definitions)
            ->pluck('category')
            ->unique()
            ->mapWithKeys(fn (string $name): array => [
                $name => Category::create(['name' => $name, 'slug' => Str::slug($name)]),
            ]);

        $products = [];

        foreach ($definitions as $index => $definition) {
            $product = Product::create([
                'category_id' => $categories[$definition['category']]->id,
                'sku' => $definition['sku'],
                'name' => $definition['name'],
                'stock_quantity' => 0,
                'low_stock_threshold' => $definition['threshold'],
                'average_cost' => 0,
                'is_active' => true,
            ]);
            $baseUnit = $product->units()->create([
                'name' => $definition['base'],
                'conversion_to_base' => 1,
                'barcode' => '899000000'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'is_base_unit' => true,
            ]);
            $packUnit = $product->units()->create([
                'name' => $definition['pack'],
                'conversion_to_base' => $definition['conversion'],
                'barcode' => '899100000'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'is_base_unit' => false,
            ]);
            $baseUnit->priceTiers()->create(['min_qty' => 1, 'price' => $definition['base_price']]);
            $packUnit->priceTiers()->createMany([
                ['min_qty' => 1, 'price' => $definition['pack_price']],
                ['min_qty' => 10, 'price' => $definition['wholesale_price']],
            ]);

            $products[] = [
                'product' => $product,
                'unit' => $packUnit,
                'cost' => $definition['cost'],
                'closing_stock' => $definition['closing_stock'],
            ];
        }

        $dailySales = [];
        $soldBaseByProduct = array_fill(0, count($products), 0);

        for ($day = 0; $day < 30; $day++) {
            $dailySales[$day] = [];

            foreach ($products as $index => $productData) {
                if (($day + $index) % 3 === 1) {
                    continue;
                }

                $quantity = 1 + (($day + $index) % 3);
                if ($index === 0 && $day % 10 === 0) {
                    $quantity = 10;
                }

                $dailySales[$day][] = [
                    'product_unit_id' => $productData['unit']->id,
                    'quantity' => $quantity,
                ];
                $soldBaseByProduct[$index] += $quantity * $productData['unit']->conversion_to_base;
            }
        }

        $openingDate = now()->subDays(31);

        foreach ($products as $index => $productData) {
            $openingLog = $stockService->receive(
                $productData['product']->id,
                $productData['closing_stock'] + $soldBaseByProduct[$index],
                $productData['cost'],
                'Saldo awal demo',
                null,
            );
            $openingLog->forceFill(['created_at' => $openingDate, 'updated_at' => $openingDate])->save();
        }

        foreach ($dailySales as $day => $items) {
            $transaction = $transactionService->checkout(null, $items, 'Transaksi historis demo');
            $occurredAt = now()->subDays(29 - $day)->setTime(8 + ($day % 10), ($day * 7) % 60);
            $transaction->forceFill(['created_at' => $occurredAt, 'updated_at' => $occurredAt])->save();
            $transaction->items()->update(['created_at' => $occurredAt, 'updated_at' => $occurredAt]);
            InventoryLog::query()
                ->where('transaction_id', $transaction->id)
                ->update(['created_at' => $occurredAt, 'updated_at' => $occurredAt]);
        }
    }
}
