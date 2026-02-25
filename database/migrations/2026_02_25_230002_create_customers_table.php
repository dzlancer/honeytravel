<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('whatsapp')->nullable()->index();
            $table->string('city')->nullable();
            $table->string('country')->default('Algeria');
            $table->string('passport_number')->nullable();
            $table->string('psid')->nullable(); // Facebook Page Scoped ID
            $table->string('igid')->nullable(); // Instagram ID
            $table->json('preferences')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_vip')->default(false);
            $table->integer('loyalty_points')->default(0);
            $table->string('referral_code')->nullable()->unique();
            $table->string('referred_by')->nullable();
            $table->string('acquisition_channel')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
