<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class TransactionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('pos/index', [
            'products' => Product::query()
                ->where('is_active', true)
                ->with(['category:id,name', 'units.priceTiers'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('transactions/index', [
            'transactions' => Transaction::query()
                ->with(['user:id,name', 'items:id,transaction_id,product_name,unit_name,quantity,unit_price,subtotal,cost_total,profit'])
                ->latest('id')
                ->paginate(25)
                ->withQueryString(),
            'canVoid' => $request->user()->isAdmin(),
        ]);
    }

    public function store(StoreTransactionRequest $request, TransactionService $transactionService): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $transaction = $transactionService->checkout(
            $request->user(),
            $data['items'],
            $data['note'] ?? null,
            $data['client_key'] ?? null,
        );

        if ($request->expectsJson()) {
            return response()->json($transaction->only(['id', 'receipt_number', 'total_amount', 'total_cost', 'total_profit']));
        }

        return back()
            ->with('success', "Transaksi {$transaction->receipt_number} berhasil disimpan.")
            ->with('createdTransaction', $transaction->only(['id', 'receipt_number', 'total_amount', 'total_cost', 'total_profit']));
    }

    public function destroy(Transaction $transaction, TransactionService $transactionService, Request $request): RedirectResponse
    {
        $transactionService->void($transaction, $request->user());

        return back()->with('success', "Transaksi {$transaction->receipt_number} dibatalkan dan stok dikembalikan.");
    }
}
