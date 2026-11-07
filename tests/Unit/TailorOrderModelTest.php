<?php

namespace Tests\Unit;

use App\Models\Service;
use App\Models\TailorOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TailorOrderModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_tailor_order_relations_and_paid_helper(): void
    {
        $user = User::factory()->create();
        $service = Service::create([
            'name' => 'Kemeja Formal',
            'description' => 'Jahit kemeja formal presisi',
            'price' => 250000,
            'lead_days' => 5,
            'image' => 'services/shirt.jpg',
        ]);

        $order = TailorOrder::create([
            'number' => 'ORD-1001',
            'user_id' => $user->id,
            'service_id' => $service->id,
            'service_name' => $service->name,
            'quantity' => 1,
            'fabric' => 'standar',
            'detail' => 'standar',
            'measurements' => ['chest' => 96, 'waist' => 82],
            'estimate' => 250000,
            'requested_date' => now()->addDays(7)->toDateString(),
            'status' => 'submitted',
        ]);

        $this->assertTrue($order->service->is($service));
        $this->assertTrue($service->orders->contains($order));
        $this->assertFalse($order->isPaid());

        $order->paid_at = now();
        $order->save();
        $this->assertTrue($order->isPaid());
    }
}
