<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterAdminRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function createAdmin(): Response|RedirectResponse
    {
        if (User::query()->where('role', User::ROLE_ADMIN)->exists()) {
            return redirect()->route('login', ['role' => User::ROLE_ADMIN]);
        }

        return Inertia::render('auth/register', ['role' => User::ROLE_ADMIN]);
    }

    public function storeAdmin(RegisterAdminRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request): User {
            if (User::query()->where('role', User::ROLE_ADMIN)->lockForUpdate()->exists()) {
                throw ValidationException::withMessages([
                    'email' => 'Admin pertama sudah dibuat. Silakan masuk.',
                ]);
            }

            $user = User::create([
                ...$request->safe()->only(['name', 'email', 'password']),
                'role' => User::ROLE_ADMIN,
            ]);

            $user->forceFill(['admin_slot' => 'primary'])->save();

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
