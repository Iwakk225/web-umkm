<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($this->route('product'))],
            'name' => ['required', 'string', 'max:255'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'base_unit' => ['required', 'string', 'max:60'],
            'base_price' => ['required', 'integer', 'min:1'],
            'base_barcode' => ['nullable', 'string', 'max:80', Rule::unique('product_units', 'barcode')->ignore($this->baseUnitId())],
            'wholesale_min_qty' => ['nullable', 'integer', 'min:2'],
            'wholesale_price' => ['nullable', 'integer', 'min:1', 'required_with:wholesale_min_qty'],
            'pack_unit' => ['nullable', 'string', 'max:60', 'required_with:pack_conversion,pack_price'],
            'pack_conversion' => ['nullable', 'integer', 'min:2', 'required_with:pack_unit'],
            'pack_price' => ['nullable', 'integer', 'min:1', 'required_with:pack_unit'],
            'pack_barcode' => ['nullable', 'string', 'max:80', Rule::unique('product_units', 'barcode')->ignore($this->packUnitId())],
            'pack_wholesale_min_qty' => ['nullable', 'integer', 'min:2'],
            'pack_wholesale_price' => ['nullable', 'integer', 'min:1', 'required_with:pack_wholesale_min_qty'],
        ];
    }

    private function baseUnitId(): ?int
    {
        $product = $this->route('product');

        return $product instanceof Product
            ? $product->units()->where('is_base_unit', true)->value('id')
            : null;
    }

    private function packUnitId(): ?int
    {
        $product = $this->route('product');

        return $product instanceof Product
            ? $product->units()->where('is_base_unit', false)->value('id')
            : null;
    }
}
