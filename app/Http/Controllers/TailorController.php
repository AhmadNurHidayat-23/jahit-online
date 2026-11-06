<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\TailorOrder;
use App\Services\TailoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TailorController extends Controller
{
    public function store(Request $r, Service $service, TailoringService $s)
    {
        abort_unless($r->user()->role === 'customer', 403);
        $d = $r->validate(['quantity' => 'required|integer|min:1|max:10', 'fabric' => 'required|in:customer,atelier', 'detail' => 'required|in:simple,detailed', 'measurements' => 'required|array:chest,waist,hips,shoulder,sleeve,length', 'measurements.chest' => 'required|numeric|between:40,200', 'measurements.waist' => 'required|numeric|between:40,200', 'measurements.hips' => 'required|numeric|between:40,220', 'measurements.shoulder' => 'required|numeric|between:20,80', 'measurements.sleeve' => 'required|numeric|between:5,100', 'measurements.length' => 'required|numeric|between:20,200', 'reference' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072', 'notes' => 'nullable|string|max:1000', 'requested_date' => 'required|date_format:Y-m-d|after_or_equal:'.now()->addDays($service->lead_days)->toDateString().'|before_or_equal:'.now()->addYear()->toDateString()]);
        $path = $r->file('reference')?->store('references', 'local');
        try {
            $o = $s->record($r->user(), $service, $d, $path);
        } catch (\Throwable $e) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }throw $e;
        }

return redirect('/pesanan/'.$o->id)->with('success', 'Pesanan tersimpan. Tim kami akan meninjau ukuran dan mengirim penawaran final.');
    }

    public function index(Request $r)
    {
        $d = $r->validate(['status' => 'nullable|in:submitted,quoted,confirmed,cutting,sewing,fitting,completed,cancelled']);
        $q = TailorOrder::query()->with('user:id,name')->when($r->user()->role !== 'staff', fn ($q) => $q->where('user_id', $r->user()->id))->when($d['status'] ?? null, fn ($q, $s) => $q->where('status', $s));

        return Inertia::render('Orders', ['orders' => $q->latest()->paginate(15)->withQueryString(), 'status' => $d['status'] ?? '']);
    }

    private function authorizeOrder(Request $r, TailorOrder $order): void
    {
        abort_unless($r->user()->role === 'staff' || $order->user_id === $r->user()->id, 403);
    }

    public function show(Request $r, TailorOrder $order)
    {
        $this->authorizeOrder($r, $order);

        return Inertia::render('Detail', ['order' => $order->load(['user:id,name,email', 'events' => fn ($q) => $q->orderBy('id')])]);
    }

    public function invoice(Request $r, TailorOrder $order)
    {
        $this->authorizeOrder($r, $order);

        return Inertia::render('Invoice', ['order' => $order->load('user:id,name,email')]);
    }

    public function reference(Request $r, TailorOrder $order)
    {
        $this->authorizeOrder($r, $order);
        abort_unless($order->reference_path && Storage::disk('local')->exists($order->reference_path), 404);

        return Storage::disk('local')->response($order->reference_path, null, ['Cache-Control' => 'private, no-store']);
    }

    public function update(Request $r, TailorOrder $order, TailoringService $s)
    {
        $this->authorizeOrder($r, $order);
        $d = $r->validate(['action' => 'required|in:accept,cancel,paid,cutting,sewing,fitting,completed', 'quote_revision' => 'required_if:action,accept|nullable|integer|min:0']);
        $s->change($r->user(), $order->id, $d['action'], $d['quote_revision'] ?? null);

        return back()->with('success', 'Perubahan pesanan tercatat.');
    }

    public function quote(Request $r, TailorOrder $order, TailoringService $s)
    {
        $d = $r->validate(['final_price' => 'required|integer|min:1000|max:100000000', 'due_date' => 'required|date_format:Y-m-d|after_or_equal:today|before_or_equal:'.now()->addYear()->toDateString(), 'quote_note' => 'required|string|min:5|max:500']);
        $s->quote($r->user(),$order->id,$d);

        return back()->with('success','Penawaran dikirim. Produksi dimulai setelah pelanggan menyetujui.');
    }
}
