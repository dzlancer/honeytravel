<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // excursion, transfer, pass, cruise, other
            $table->string('title');
            $table->string('title_fr')->nullable();
            $table->text('description')->nullable();
            $table->text('description_fr')->nullable();
            $table->decimal('price_dzd', 12, 2)->default(0);
            $table->decimal('price_eur', 10, 2)->default(0);
            $table->decimal('cost_dzd', 12, 2)->default(0); // supplier cost
            $table->string('duration')->nullable(); // e.g., "4 hours", "Full day"
            $table->string('supplier_name')->nullable();
            $table->string('supplier_contact')->nullable();
            $table->decimal('supplier_commission', 5, 2)->default(0); // percentage
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
