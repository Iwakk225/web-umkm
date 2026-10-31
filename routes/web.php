<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login/{role}', [AuthenticatedSessionController::class, 'create'])
        ->whereIn('role', ['admin', 'kasir'])
        ->name('login');
    Route::post('/login/{role}', [AuthenticatedSessionController::class, 'store'])
        ->whereIn('role', ['admin', 'kasir'])
        ->middleware('throttle:6,1')
        ->name('login.store');
    Route::get('/register/admin', [RegisteredUserController::class, 'createAdmin'])->name('register.admin');
    Route::post('/register/admin', [RegisteredUserController::class, 'storeAdmin'])
        ->middleware('throttle:3,1')
        ->name('register.admin.store');
});

Route::middleware(['auth', 'role:admin'])->group(function (): void {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
    Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
    Route::get('/register/kasir', [UserController::class, 'create'])->name('register.cashier');
    Route::get('/stok', [StockController::class, 'index'])->name('stock.index');
    Route::post('/stok', [StockController::class, 'store'])->name('stock.store');
    Route::post('/stok/{product}/penyesuaian', [StockController::class, 'adjust'])->name('stock.adjust');
    Route::get('/laporan', [ReportsController::class, 'index'])->name('reports.index');
    Route::resource('pengiriman', DeliveryController::class)
        ->parameters(['pengiriman' => 'delivery'])
        ->except(['create', 'edit', 'show']);
    Route::delete('/transaksi/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
});

Route::middleware(['auth', 'role:admin,kasir'])->group(function (): void {
    Route::get('/kasir', [TransactionController::class, 'create'])->name('pos.index');
    Route::post('/transaksi', [TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transaksi', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
