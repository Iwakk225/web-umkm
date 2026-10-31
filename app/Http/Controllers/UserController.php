<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('users/index', [
            'users' => User::query()->where('role', User::ROLE_CASHIER)->orderBy('name')->get(['id', 'name', 'email', 'created_at']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', ['role' => User::ROLE_CASHIER]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            ...$request->validated(),
            'role' => User::ROLE_CASHIER,
        ]);

        return redirect()->route('users.index')->with('success', 'Akun kasir berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        abort_unless($user->role === User::ROLE_CASHIER, 404);
        $data = $request->validated();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update(Arr::only($data, ['name', 'email', 'password']));

        return back()->with('success', 'Akun kasir berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        abort_unless($user->role === User::ROLE_CASHIER, 404);
        abort_if(auth()->id() === $user->id, 403);

        $user->delete();

        return back()->with('success', 'Akun kasir berhasil dihapus.');
    }
}
