<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('hotel_id', 10)->unique(); // HT0001
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('description_ar')->nullable();
            $table->integer('star_rating')->default(3);
            $table->string('address')->nullable();
            $table->string('district')->nullable()->index();
            $table->string('city')->default('Istanbul');
            $table->string('country')->default('Turkey');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('base_price_dzd', 12, 2)->default(0);
            $table->decimal('sale_price_dzd', 12, 2)->default(0);
            $table->decimal('base_price_eur', 10, 2)->default(0);
            $table->decimal('sale_price_eur', 10, 2)->default(0);
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->json('seo_meta')->nullable(); // {meta_title, meta_description, keywords}
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->integer('total_rooms')->default(20);
            $table->integer('available_rooms')->default(15);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['district', 'is_active']);
            $table->index(['star_rating', 'is_active']);
            $table->index(['sale_price_dzd', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
