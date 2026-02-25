<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id' => 'required|exists:hotel_variants,id',
            'full_name' => 'required|string|min:3|max:255',
            'phone' => ['required', 'string', 'min:10', 'regex:/^\+?213/'],
            'whatsapp' => ['required', 'string', 'min:10', 'regex:/^\+?213/'],
            'email' => 'nullable|email|max:255',
            'city' => 'nullable|string|max:100',
            'passport_number' => 'nullable|string|max:50',
            'check_in' => 'required|date|after:today',
            'check_out' => 'required|date|after:check_in',
            'rooms' => 'integer|min:1|max:10',
            'guests' => 'integer|min:1|max:20',
            'payment_method' => 'required|in:cib,baridimob,cash,reserve',
            'channel' => 'nullable|string|in:website,whatsapp,instagram,facebook,tiktok,api',
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Le numero de telephone doit commencer par +213.',
            'whatsapp.regex' => 'Le numero WhatsApp doit commencer par +213.',
            'check_in.after' => 'La date de check-in doit etre dans le futur.',
            'check_out.after' => 'La date de check-out doit etre apres le check-in.',
        ];
    }
}
