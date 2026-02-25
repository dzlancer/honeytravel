<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_proof_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // booking, view, search
            $table->string('hotel_name')->nullable();
            $table->string('city')->nullable();
            $table->integer('count')->default(1);
            $table->timestamps();

            $table->index(['event_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_proof_events');
    }
};
