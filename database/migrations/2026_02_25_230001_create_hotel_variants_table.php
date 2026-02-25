<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->string('variant_id', 15)->unique(); // HT0001_4N
            $table->integer('nights');
            $table->decimal('base_price_dzd', 12, 2)->default(0);
            $table->decimal('sale_price_dzd', 12, 2)->default(0);
            $table->decimal('base_price_eur', 10, 2)->default(0);
            $table->decimal('sale_price_eur', 10, 2)->default(0);
            $table->json('pricing_rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['hotel_id', 'nights']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_variants');
    }
};
