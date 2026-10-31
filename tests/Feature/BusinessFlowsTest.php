<?php

use App\Models\Category;
use App\Models\Delivery;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;

it('applies the highest wholesale tier, snapshots weighted cost, and consumes converted base stock', function () {
    $cashier = User::factory()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 120,
        'average_cost' => 2000,
    ]);
    $caseUnit = ProductUnit::factory()->for($product)->create([
        'name' => 'dus',
        'conversion_to_base' => 12,
        'is_base_unit' => false,
    ]);
    $caseUnit->priceTiers()->createMany([
        ['min_qty' => 1, 'price' => 30000],
        ['min_qty' => 10, 'price' => 27000],
    ]);

    $response = $this->actingAs($cashier)->post(route('transactions.store'), [
        'items' => [['product_unit_id' => $caseUnit->id, 'quantity' => 10]],
    ]);

    $response->assertRedirect();
    $transaction = Transaction::query()->with('items')->firstOrFail();
    $product->refresh();
    $item = $transaction->items->sole();

    expect($transaction->total_amount)->toBe(270000)
        ->and($transaction->total_cost)->toBe(240000)
        ->and($transaction->total_profit)->toBe(30000)
        ->and($item->unit_price)->toBe(27000)
        ->and($item->quantity_base)->toBe(120)
        ->and($item->unit_cost_per_base)->toBe(2000)
        ->and($product->stock_quantity)->toBe(0);

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $product->id,
        'transaction_id' => $transaction->id,
        'type' => 'keluar',
        'quantity' => 120,
    ]);
});

it('rolls back the complete sale when stock is insufficient', function () {
    $cashier = User::factory()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 9,
        'average_cost' => 1000,
    ]);
    $unit = ProductUnit::factory()->for($product)->create();
    $unit->priceTiers()->create(['min_qty' => 1, 'price' => 1500]);

    $response = $this->from(route('pos.index'))
        ->actingAs($cashier)
        ->post(route('transactions.store'), [
            'items' => [['product_unit_id' => $unit->id, 'quantity' => 10]],
        ]);

    $response->assertSessionHasErrors('items');
    expect($product->fresh()->stock_quantity)->toBe(9);
    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('inventory_logs', 0);
});

it('makes offline transaction retries idempotent', function () {
    $cashier = User::factory()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 10,
        'average_cost' => 1000,
    ]);
    $unit = ProductUnit::factory()->for($product)->create();
    $unit->priceTiers()->create(['min_qty' => 1, 'price' => 2000]);
    $payload = [
        'client_key' => '123e4567-e89b-12d3-a456-426614174000',
        'items' => [['product_unit_id' => $unit->id, 'quantity' => 2]],
    ];

    $this->actingAs($cashier);
    $firstResponse = $this->postJson(route('transactions.store'), $payload)->assertOk();
    $this->postJson(route('transactions.store'), $payload)
        ->assertOk()
        ->assertJsonPath('receipt_number', $firstResponse->json('receipt_number'));

    expect($product->fresh()->stock_quantity)->toBe(8);
    $this->assertDatabaseCount('transactions', 1);
    $this->assertDatabaseCount('inventory_logs', 1);
});

it('updates weighted average cost when stock is received', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 10,
        'average_cost' => 3000,
    ]);
    $baseUnit = ProductUnit::factory()->for($product)->create([
        'name' => 'pcs',
        'conversion_to_base' => 1,
        'is_base_unit' => true,
    ]);

    $response = $this->actingAs($admin)->post(route('stock.store'), [
        'product_unit_id' => $baseUnit->id,
        'quantity' => 10,
        'unit_cost' => 5000,
        'note' => 'Kirim supplier',
    ]);

    $response->assertRedirect();
    expect($product->fresh()->stock_quantity)->toBe(20)
        ->and($product->fresh()->average_cost)->toBe(4000);
    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $product->id,
        'type' => 'masuk',
        'quantity' => 10,
        'stock_before' => 10,
        'stock_after' => 20,
    ]);
});

it('cancels a transaction by restoring stock while retaining its history', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 5,
        'average_cost' => 2000,
    ]);
    $transaction = Transaction::factory()->create();
    TransactionItem::factory()->create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'product_unit_id' => null,
        'quantity_base' => 5,
        'unit_cost_per_base' => 2000,
    ]);

    $response = $this->actingAs($admin)->delete(route('transactions.destroy', $transaction));

    $response->assertRedirect();
    expect($transaction->fresh()->status)->toBe('voided')
        ->and($product->fresh()->stock_quantity)->toBe(10);
    $this->assertDatabaseHas('inventory_logs', [
        'transaction_id' => $transaction->id,
        'type' => 'masuk',
        'quantity' => 5,
    ]);
});

it('creates, updates, and archives a product without deleting its transaction-safe record', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();
    $productData = [
        'category_id' => $category->id,
        'sku' => 'BERAS-01',
        'name' => 'Beras Ramos',
        'low_stock_threshold' => 20,
        'base_unit' => 'kg',
        'base_price' => 10000,
        'wholesale_min_qty' => 10,
        'wholesale_price' => 9000,
        'pack_unit' => 'bal',
        'pack_conversion' => 5,
        'pack_price' => 50000,
        'pack_wholesale_min_qty' => 10,
        'pack_wholesale_price' => 45000,
    ];

    $this->actingAs($admin)->post(route('products.store'), $productData)->assertRedirect();
    $product = Product::query()->where('sku', 'BERAS-01')->firstOrFail();
    $packUnit = $product->units()->where('name', 'bal')->firstOrFail();

    expect($packUnit->conversion_to_base)->toBe(5)
        ->and($packUnit->priceTiers()->where('min_qty', 10)->value('price'))->toBe(45000);

    $productData['name'] = 'Beras Ramos Premium';
    $productData['pack_wholesale_price'] = 44000;
    $this->put(route('products.update', $product), $productData)->assertRedirect();

    expect($product->fresh()->name)->toBe('Beras Ramos Premium')
        ->and($packUnit->priceTiers()->where('min_qty', 10)->value('price'))->toBe(44000);

    $this->delete(route('products.destroy', $product))->assertRedirect();
    $this->assertSoftDeleted('products', ['id' => $product->id]);
});

it('persists, recalculates, updates, and deletes a volumetric delivery', function () {
    $admin = User::factory()->admin()->create();
    $data = [
        'recipient' => 'Agen Melati',
        'destination' => 'Bandung',
        'package_length_cm' => 40,
        'package_width_cm' => 30,
        'package_height_cm' => 25,
        'package_count' => 12,
        'actual_weight_kg' => 1.7,
        'note' => 'Pengiriman pagi',
    ];

    $this->actingAs($admin)->post(route('pengiriman.store'), $data)->assertRedirect();
    $delivery = Delivery::query()->firstOrFail();

    expect($delivery->volume_cm3)->toBe(360000)
        ->and($delivery->volumetric_weight_grams)->toBe(60000)
        ->and($delivery->actual_weight_grams)->toBe(1700)
        ->and($delivery->recommended_vehicle)->toBe('Pickup');

    $data['status'] = 'ready';
    $this->put(route('pengiriman.update', ['delivery' => $delivery->id]), $data)->assertRedirect();
    expect($delivery->fresh()->status)->toBe('ready');

    $this->delete(route('pengiriman.destroy', ['delivery' => $delivery->id]))->assertRedirect();
    $this->assertDatabaseMissing('deliveries', ['id' => $delivery->id]);
});

it('renders every owner module from persisted records', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 5,
        'low_stock_threshold' => 10,
    ]);
    $unit = ProductUnit::factory()->for($product)->create();
    $unit->priceTiers()->create(['min_qty' => 1, 'price' => 2000]);
    $transaction = Transaction::factory()->create([
        'user_id' => $admin->id,
        'total_amount' => 2000,
        'total_cost' => 1000,
        'total_profit' => 1000,
    ]);
    TransactionItem::factory()->create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'product_unit_id' => $unit->id,
    ]);
    InventoryLog::factory()->create([
        'product_id' => $product->id,
        'user_id' => $admin->id,
    ]);
    Delivery::factory()->create(['user_id' => $admin->id]);

    foreach ([
        'dashboard',
        'products.index',
        'categories.index',
        'stock.index',
        'reports.index',
        'transactions.index',
        'pengiriman.index',
        'users.index',
    ] as $routeName) {
        $this->actingAs($admin)->get(route($routeName))->assertOk();
    }
});
