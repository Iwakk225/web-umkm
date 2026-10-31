<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliveryRequest extends FormRequest
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
            'recipient' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'package_length_cm' => ['required', 'integer', 'min:1', 'max:10000'],
            'package_width_cm' => ['required', 'integer', 'min:1', 'max:10000'],
            'package_height_cm' => ['required', 'integer', 'min:1', 'max:10000'],
            'package_count' => ['required', 'integer', 'min:1', 'max:100000'],
            'actual_weight_kg' => ['required', 'numeric', 'min:0', 'max:100000'],
            'status' => ['required', 'in:draft,ready,sent,delivered'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
