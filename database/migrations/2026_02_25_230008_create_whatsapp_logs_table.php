<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('direction'); // inbound, outbound
            $table->string('message_type')->default('text'); // text, template, media
            $table->text('content')->nullable();
            $table->string('template_name')->nullable();
            $table->string('status')->default('sent'); // sent, delivered, read, failed
            $table->string('whatsapp_message_id')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'created_at']);
            $table->index(['customer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_logs');
    }
};
