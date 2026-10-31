<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
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
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_unit_id' => ['required', 'integer', 'exists:product_units,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'client_key' => ['nullable', 'uuid'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
