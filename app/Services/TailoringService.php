<?php

namespace App\Services;

use App\Models\Service;
use App\Models\TailorOrder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TailoringService
{
    public function estimate(Service $s, int $quantity, string $fabric, string $detail): int
    {
        return ($s->price + ($fabric === 'atelier' ? 150000 : 0) + ($detail === 'detailed' ? 60000 : 0)) * $quantity;
    }

    public function record(User $user, Service $s, array $data, ?string $reference): TailorOrder
    {
        return DB::transaction(function () use ($user, $s, $data, $reference) {
            $o = TailorOrder::create(['number' => 'SH-'.strtoupper(Str::random(8)), 'user_id' => $user->id, 'service_id' => $s->id, 'service_name' => $s->name, 'quantity' => $data['quantity'], 'fabric' => $data['fabric'], 'detail' => $data['detail'], 'measurements' => $data['measurements'], 'reference_path' => $reference, 'notes' => $data['notes'] ?? null, 'estimate' => $this->estimate($s, $data['quantity'], $data['fabric'], $data['detail']), 'requested_date' => $data['requested_date']]);
            $o->events()->create(['actor_id' => $user->id, 'description' => 'Pesanan diterima untuk peninjauan ukuran dan desain.']);

            return $o;
        });
    }

    public function quote(User $actor, int $id, array $data): void
    {
        DB::transaction(function () use ($actor, $id, $data) {
            $o = TailorOrder::lockForUpdate()->findOrFail($id);
            if (! in_array($o->status, ['submitted', 'quoted'])) {
                throw ValidationException::withMessages(['order' => 'Penawaran tidak dapat diubah setelah disetujui.']);
            }$o->update(['final_price' => $data['final_price'], 'due_date' => $data['due_date'], 'quote_note' => $data['quote_note'], 'status' => 'quoted', 'quote_revision' => $o->quote_revision + 1]);
            $o->events()->create(['actor_id' => $actor->id, 'description' => 'Penawaran total Rp '.number_format($o->final_price, 0, ',', '.').' dan jadwal '.$o->due_date->format('d/m/Y').' dikirim untuk persetujuan.']);
        }, 3);
    }

    public function change(User $actor, int $id, string $action, ?int $revision = null): void
    {
        DB::transaction(function () use ($actor, $id, $action, $revision) {
            $o = TailorOrder::lockForUpdate()->findOrFail($id);
            $staff = $actor->role === 'staff';
            $valid = false;
            $description = '';
            if ($action === 'accept' && ! $staff && $o->user_id === $actor->id && $o->status === 'quoted') {
                if ($revision !== $o->quote_revision) {
                    throw ValidationException::withMessages(['order' => 'Penawaran berubah. Muat ulang dan periksa biaya serta jadwal terbaru.']);
                }$o->status = 'confirmed';
                $valid = true;
                $description = 'Pelanggan menyetujui penawaran dan jadwal pengerjaan.';
            } elseif ($action === 'cancel' && ! $staff && $o->user_id === $actor->id && in_array($o->status, ['submitted', 'quoted'])) {
                $o->status = 'cancelled';
                $valid = true;
                $description = 'Pesanan dibatalkan pelanggan sebelum produksi.';
            } elseif ($action === 'paid' && $staff && in_array($o->status, ['confirmed', 'cutting', 'sewing', 'fitting']) && ! $o->paid_at) {
                $o->paid_at = now();
                $valid = true;
                $description = 'Petugas mengonfirmasi pembayaran manual telah diterima.';
            } elseif ($staff && (['confirmed' => 'cutting', 'cutting' => 'sewing', 'sewing' => 'fitting', 'fitting' => 'completed'][$o->status] ?? null) === $action) {
                if ($action === 'completed' && ! $o->paid_at) {
                    throw ValidationException::withMessages(['order' => 'Konfirmasikan pembayaran sebelum menyelesaikan pesanan.']);
                }$o->status = $action;
                $valid = true;
                $description = 'Produksi: '.['cutting' => 'pemotongan kain', 'sewing' => 'penjahitan', 'fitting' => 'fitting akhir', 'completed' => 'selesai'][$action].'.';
            }
            if (! $valid) {
                throw ValidationException::withMessages(['order' => 'Tindakan tidak sesuai status atau hak akses.']);
            }$o->save();
            $o->events()->create(['actor_id' => $actor->id, 'description' => $description]);
        }, 3);
    }
}
