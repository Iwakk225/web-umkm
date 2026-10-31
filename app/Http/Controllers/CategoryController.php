<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('categories/index', [
            'categories' => Category::query()->withCount('products')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $name = $request->string('name')->toString();
        $slug = Str::slug($name) ?: Str::lower(Str::random(8));

        Category::create(['name' => $name, 'slug' => $slug]);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $name = $request->string('name')->toString();
        $category->update([
            'name' => $name,
            'slug' => Str::slug($name) ?: Str::lower(Str::random(8)),
        ]);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Kategori masih dipakai produk dan tidak dapat dihapus.',
            ]);
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
