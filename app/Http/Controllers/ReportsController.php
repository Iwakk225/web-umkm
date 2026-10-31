<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->string('period')->toString();
        $start = match ($period) {
            'hari' => now()->startOfDay(),
            'minggu' => now()->startOfWeek(),
            default => now()->startOfMonth(),
        };

        $totals = Transaction::query()
            ->where('status', 'paid')
            ->where('created_at', '>=', $start)
            ->selectRaw('COALESCE(SUM(total_amount), 0) as sales, COALESCE(SUM(total_cost), 0) as cost, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as count')
            ->first();

        return Inertia::render('reports/index', [
            'period' => in_array($period, ['hari', 'minggu', 'bulan'], true) ? $period : 'bulan',
            'summary' => [
                'sales' => (int) $totals->sales,
                'cost' => (int) $totals->cost,
                'profit' => (int) $totals->profit,
                'count' => (int) $totals->count,
            ],
            'daily' => Transaction::query()
                ->where('status', 'paid')
                ->where('created_at', '>=', $start)
                ->selectRaw('DATE(created_at) as day, SUM(total_amount) as sales, SUM(total_profit) as profit')
                ->groupBy('day')
                ->orderBy('day')
                ->get(),
            'bestSellers' => TransactionItem::query()
                ->select('product_name', DB::raw('SUM(quantity_base) as quantity_base'), DB::raw('SUM(subtotal) as sales'), DB::raw('SUM(profit) as profit'))
                ->whereHas('transaction', fn ($query) => $query->where('status', 'paid')->where('created_at', '>=', $start))
                ->groupBy('product_name')
                ->orderByDesc('quantity_base')
                ->limit(10)
                ->get(),
            'transactions' => Transaction::query()
                ->with(['user:id,name', 'items:id,transaction_id,product_name,unit_name,quantity,subtotal,profit'])
                ->where('created_at', '>=', $start)
                ->latest('id')
                ->paginate(25)
                ->withQueryString(),
        ]);
    }
}
