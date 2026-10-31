<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(string $role): Response|RedirectResponse
    {
        abort_unless(in_array($role, [User::ROLE_ADMIN, User::ROLE_CASHIER], true), 404);

        if (auth()->check()) {
            return redirect()->route(auth()->user()->isAdmin() ? 'dashboard' : 'pos.index');
        }

        return Inertia::render('auth/login', [
            'role' => $role,
            'adminRegistered' => User::query()->where('role', User::ROLE_ADMIN)->exists(),
        ]);
    }

    public function store(LoginRequest $request, string $role): RedirectResponse
    {
        abort_unless(in_array($role, [User::ROLE_ADMIN, User::ROLE_CASHIER], true), 404);

        if (! Auth::attempt([
            ...$request->safe()->only(['email', 'password']),
            'role' => $role,
        ], $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email, kata sandi, atau peran tidak sesuai.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route($role === User::ROLE_ADMIN ? 'dashboard' : 'pos.index'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login', ['role' => 'admin']);
    }
}
