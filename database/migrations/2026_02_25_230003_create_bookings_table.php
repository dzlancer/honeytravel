<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique(); // BK-XXXXXX
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->foreign('variant_id')->references('id')->on('hotel_variants')->nullOnDelete();
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('nights')->default(4);
            $table->integer('guests')->default(2);
            $table->integer('rooms')->default(1);
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed, refunded
            $table->string('payment_status')->default('unpaid'); // unpaid, partial, paid, refunded
            $table->string('payment_method')->nullable(); // cib_d17, baridimob, cash, reserve
            $table->decimal('total_dzd', 12, 2)->default(0);
            $table->decimal('total_eur', 10, 2)->default(0);
            $table->decimal('paid_amount_dzd', 12, 2)->default(0);
            $table->json('price_breakdown')->nullable();
            $table->json('guest_details')->nullable(); // passport, special requests
            $table->string('channel')->default('website'); // website, whatsapp, tiktok, instagram, facebook
            $table->string('cancellation_reason')->nullable();
            $table->text('internal_notes')->nullable();
            // Meta CAPI tracking
            $table->string('fbp')->nullable(); // Facebook browser pixel
            $table->string('fbc')->nullable(); // Facebook click ID
            $table->string('event_source_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index(['customer_id', 'status']);
            $table->index(['hotel_id', 'check_in']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
