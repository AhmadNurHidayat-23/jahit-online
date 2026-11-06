<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->string('role')->default('customer'));
        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('description');
            $t->unsignedInteger('price');
            $t->unsignedInteger('lead_days');
            $t->string('image');
            $t->timestamps();
        });
        Schema::create('tailor_orders', function (Blueprint $t) {
            $t->id();
            $t->string('number')->unique();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('service_id')->constrained();
            $t->string('service_name');
            $t->unsignedInteger('quantity');
            $t->string('fabric');
            $t->string('detail');
            $t->json('measurements');
            $t->string('reference_path')->nullable();
            $t->text('notes')->nullable();
            $t->unsignedBigInteger('estimate');
            $t->unsignedBigInteger('final_price')->nullable();
            $t->unsignedInteger('quote_revision')->default(0);
            $t->date('requested_date');
            $t->date('due_date')->nullable();
            $t->text('quote_note')->nullable();
            $t->string('status')->default('submitted');
            $t->timestamp('paid_at')->nullable();
            $t->timestamps();
        });
        Schema::create('tailor_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('tailor_order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('actor_id')->constrained('users');
            $t->string('description');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tailor_events');
        Schema::dropIfExists('tailor_orders');
        Schema::dropIfExists('services');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
    }
};
