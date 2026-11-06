<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\TailorOrder;
use App\Models\User;
use App\Services\TailoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TailoringTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    private User $staff;

    private Service $service;

    private TailoringService $tailor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
        $this->customer = User::factory()->create();
        $this->staff = User::factory()->create();
        $this->staff->forceFill(['role' => 'staff'])->save();
        $this->service = Service::first();
        $this->tailor = new TailoringService;
    }

    private function data(): array
    {
        return ['quantity' => 2, 'fabric' => 'atelier', 'detail' => 'detailed', 'measurements' => ['chest' => 90, 'waist' => 75, 'hips' => 95, 'shoulder' => 40, 'sleeve' => 60, 'length' => 70], 'requested_date' => now()->addDays(20)->toDateString(), 'notes' => 'Potongan reguler'];
    }

    private function order(): TailorOrder
    {
        return $this->tailor->record($this->customer, $this->service, $this->data(), null);
    }

    private function quoted(): TailorOrder
    {
        $o = $this->order();
        $this->tailor->quote($this->staff, $o->id, ['final_price' => 900000, 'due_date' => now()->addDays(21)->toDateString(), 'quote_note' => 'Dua kemeja dengan kain atelier']);

        return $o->fresh();
    }

    public function test_estimate_is_server_calculated_and_dimensions_persist(): void
    {
        $d = $this->data() + ['estimate' => 1];
        $this->actingAs($this->customer)->post('/pesan/'.$this->service->id, $d)->assertRedirect();
        $o = TailorOrder::first();
        $this->assertSame(920000, $o->estimate);
        $this->assertSame(90, $o->measurements['chest']);
        $this->assertSame('submitted', $o->status);
    }

    public function test_reference_is_private_and_authorized(): void
    {
        Storage::fake('local');
        $d = $this->data() + ['reference' => UploadedFile::fake()->image('desain.jpg')];
        $this->actingAs($this->customer)->post('/pesan/'.$this->service->id, $d);
        $o = TailorOrder::first();
        Storage::disk('local')->assertExists($o->reference_path);
        $this->get('/pesanan/'.$o->id.'/referensi')->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $this->actingAs(User::factory()->create())->get('/pesanan/'.$o->id.'/referensi')->assertForbidden();
    }

    public function test_other_customer_cannot_read_order_or_invoice(): void
    {
        $o = $this->order();
        $this->actingAs(User::factory()->create());
        foreach (['/pesanan/'.$o->id, '/pesanan/'.$o->id.'/invoice'] as $u) {
            $this->get($u)->assertForbidden();
        }$this->get('/pesanan')->assertInertia(fn ($p) => $p->where('orders.data', []));
    }

    public function test_customer_cannot_quote_or_skip_production(): void
    {
        $o = $this->order();
        $this->actingAs($this->customer)->post('/petugas/penawaran/'.$o->id, ['final_price' => 1])->assertForbidden();
        $this->patch('/pesanan/'.$o->id, ['action' => 'completed'])->assertSessionHasErrors('order');
    }

    public function test_quote_must_be_accepted_before_cutting(): void
    {
        $o = $this->quoted();
        $this->actingAs($this->staff)->patch('/pesanan/'.$o->id, ['action' => 'cutting'])->assertSessionHasErrors('order');
        $this->actingAs($this->customer)->patch('/pesanan/'.$o->id, ['action' => 'accept', 'quote_revision' => $o->quote_revision])->assertSessionHasNoErrors();
        $this->assertSame('confirmed', $o->fresh()->status);
    }

    public function test_stale_quote_cannot_be_accepted(): void
    {
        $o = $this->quoted();
        $this->tailor->quote($this->staff, $o->id, ['final_price' => 950000, 'due_date' => now()->addDays(22)->toDateString(), 'quote_note' => 'Penyesuaian kebutuhan kain']);
        $this->actingAs($this->customer)->patch('/pesanan/'.$o->id, ['action' => 'accept', 'quote_revision' => $o->quote_revision])->assertSessionHasErrors('order');
        $this->assertSame('quoted', $o->fresh()->status);
    }

    public function test_accepted_price_cannot_change(): void
    {
        $o = $this->quoted();
        $this->tailor->change($this->customer, $o->id, 'accept', $o->quote_revision);
        $this->actingAs($this->staff)->post('/petugas/penawaran/'.$o->id, ['final_price' => 1000000, 'due_date' => now()->addDays(23)->toDateString(), 'quote_note' => 'Penawaran berubah'])->assertSessionHasErrors('order');
        $this->assertSame(900000, $o->fresh()->final_price);
    }

    public function test_production_requires_ordered_steps_and_paid_completion(): void
    {
        $o = $this->quoted();
        $this->tailor->change($this->customer, $o->id, 'accept', $o->quote_revision);
        $this->actingAs($this->staff)->patch('/pesanan/'.$o->id, ['action' => 'sewing'])->assertSessionHasErrors('order');
        foreach (['cutting', 'sewing', 'fitting'] as $a) {
            $this->tailor->change($this->staff, $o->id, $a);
        }$this->patch('/pesanan/'.$o->id, ['action' => 'completed'])->assertSessionHasErrors('order');
        $this->tailor->change($this->staff, $o->id, 'paid');
        $this->tailor->change($this->staff, $o->id, 'completed');
        $this->assertSame('completed', $o->fresh()->status);
        $this->assertNotNull($o->fresh()->paid_at);
        $this->assertCount(8, $o->fresh()->events);
    }

    public function test_payment_cannot_be_confirmed_twice(): void
    {
        $o = $this->quoted();
        $this->tailor->change($this->customer, $o->id, 'accept', $o->quote_revision);
        $this->tailor->change($this->staff, $o->id, 'paid');
        $this->actingAs($this->staff)->patch('/pesanan/'.$o->id, ['action' => 'paid'])->assertSessionHasErrors('order');
    }

    public function test_cancellation_only_before_acceptance(): void
    {
        $o = $this->quoted();
        $this->tailor->change($this->customer, $o->id, 'cancel');
        $this->assertSame('cancelled', $o->fresh()->status);
        $other = $this->quoted();
        $this->tailor->change($this->customer, $other->id, 'accept', $other->quote_revision);
        $this->actingAs($this->customer)->patch('/pesanan/'.$other->id, ['action' => 'cancel'])->assertSessionHasErrors('order');
    }

    public function test_invalid_measurements_and_dates_are_rejected(): void
    {
        $d = $this->data();
        $d['measurements']['chest'] = -1;
        $d['requested_date'] = now()->toDateString();
        $this->actingAs($this->customer)->post('/pesan/'.$this->service->id, $d)->assertSessionHasErrors(['measurements.chest', 'requested_date']);
        $this->assertSame(0, TailorOrder::count());
    }

    public function test_non_image_cannot_be_uploaded(): void
    {
        $d = $this->data() + ['reference' => UploadedFile::fake()->create('file.php', 1, 'application/x-php')];
        $this->actingAs($this->customer)->post('/pesan/'.$this->service->id, $d)->assertSessionHasErrors('reference');
    }

    public function test_invoice_contains_real_final_amount(): void
    {
        $o = $this->quoted();
        $this->actingAs($this->customer)->get('/pesanan/'.$o->id.'/invoice')->assertInertia(fn ($p) => $p->component('Invoice')->where('order.final_price', 900000)->where('order.number', $o->number));
    }

    public function test_guests_cannot_access_personal_data(): void
    {
        $o = $this->order();
        $this->get('/pesanan/'.$o->id)->assertRedirect('/masuk');
        $this->get('/pesanan/'.$o->id.'/referensi')->assertRedirect('/masuk');
    }
}
