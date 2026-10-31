<?php

use App\Models\User;

it('allows one-time first-admin registration and persists the protected role', function () {
    $response = $this->post(route('register.admin.store'), [
        'name' => 'Pemilik Toko',
        'email' => 'owner@example.test',
        'password' => 'OwnerPassword2026',
        'password_confirmation' => 'OwnerPassword2026',
        'role' => User::ROLE_CASHIER,
    ]);

    $admin = User::query()->where('email', 'owner@example.test')->firstOrFail();

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($admin);
    expect($admin->role)->toBe(User::ROLE_ADMIN);
    $this->get(route('register.admin'))->assertRedirect(route('dashboard'));

    auth()->logout();
    $this->post(route('register.admin.store'), [
        'name' => 'Pemilik Kedua',
        'email' => 'owner-two@example.test',
        'password' => 'OwnerPassword2026',
        'password_confirmation' => 'OwnerPassword2026',
    ])->assertSessionHasErrors('email');
    $this->assertDatabaseCount('users', 1);
});

it('prevents cashiers from opening owner-only pages and rejects role-mismatched sign-in', function () {
    $admin = User::factory()->admin()->create([
        'email' => 'owner@example.test',
        'password' => 'OwnerPassword2026',
    ]);
    $cashier = User::factory()->create();

    $this->actingAs($cashier)->get(route('dashboard'))->assertForbidden();
    auth()->logout();

    $this->post(route('login.store', ['role' => User::ROLE_CASHIER]), [
        'email' => $admin->email,
        'password' => 'OwnerPassword2026',
    ])->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('creates a cashier account without trusting a submitted role field', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Kasir Sore',
        'email' => 'kasir@example.test',
        'password' => 'CashierPassword2026',
        'password_confirmation' => 'CashierPassword2026',
        'role' => User::ROLE_ADMIN,
    ]);

    $response->assertRedirect(route('users.index'));
    $cashier = User::query()->where('email', 'kasir@example.test')->firstOrFail();
    expect($cashier->role)->toBe(User::ROLE_CASHIER);
});

it('redirects unauthenticated users to role sign-in and denies unauthenticated data access', function () {
    $this->get(route('products.index'))
        ->assertRedirect(route('login', ['role' => User::ROLE_ADMIN]));
});
