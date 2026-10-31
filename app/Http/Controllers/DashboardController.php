<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->startOfDay();
        $week = now()->startOfWeek();
        $month = now()->startOfMonth();
        $lowStockProducts = Product::query()
            ->where('is_active', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->with('units:id,product_id,name,conversion_to_base,is_base_unit')
            ->orderBy('stock_quantity')
            ->limit(8)
            ->get();
        $soldByProduct = TransactionItem::query()
            ->select('product_id', DB::raw('SUM(quantity_base) as sold_base'))
            ->whereNotNull('product_id')
            ->whereHas('transaction', fn ($query) => $query->where('status', 'paid')->where('created_at', '>=', now()->subDays(7)))
            ->groupBy('product_id')
            ->pluck('sold_base', 'product_id');

        $lowStock = $lowStockProducts->map(function (Product $product) use ($soldByProduct): array {
            $soldBase = (int) ($soldByProduct[$product->id] ?? 0);
            $averageDailyMilli = intdiv($soldBase * 1000, 7);

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'stock_quantity' => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'average_daily_base_milli' => $averageDailyMilli,
                'days_left_hundredths' => $averageDailyMilli > 0
                    ? intdiv($product->stock_quantity * 100_000, $averageDailyMilli)
                    : null,
                'base_unit' => $product->units->firstWhere('is_base_unit', true)?->name,
            ];
        });

        return Inertia::render('dashboard/index', [
            'today' => $this->totalsFor($today),
            'week' => $this->totalsFor($week),
            'month' => $this->totalsFor($month),
            'lowStock' => $lowStock,
            'bestSellers' => TransactionItem::query()
                ->select('product_name', DB::raw('SUM(quantity_base) as quantity_base'), DB::raw('SUM(profit) as profit'))
                ->whereHas('transaction', fn ($query) => $query->where('status', 'paid')->where('created_at', '>=', $month))
                ->groupBy('product_name')
                ->orderByDesc('quantity_base')
                ->limit(5)
                ->get(),
            'recentTransactions' => Transaction::query()
                ->with('user:id,name')
                ->where('status', 'paid')
                ->latest('id')
                ->limit(8)
                ->get(['id', 'receipt_number', 'user_id', 'total_amount', 'total_profit', 'created_at']),
            'recentInventory' => InventoryLog::query()
                ->with('product:id,name,sku')
                ->latest('id')
                ->limit(8)
                ->get(),
        ]);
    }

    /** @return array{sales: int, cost: int, profit: int, count: int} */
    private function totalsFor(CarbonInterface $start): array
    {
        $totals = Transaction::query()
            ->where('status', 'paid')
            ->where('created_at', '>=', $start)
            ->selectRaw('COALESCE(SUM(total_amount), 0) as sales, COALESCE(SUM(total_cost), 0) as cost, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as count')
            ->first();

        return [
            'sales' => (int) $totals->sales,
            'cost' => (int) $totals->cost,
            'profit' => (int) $totals->profit,
            'count' => (int) $totals->count,
        ];
    }
}
