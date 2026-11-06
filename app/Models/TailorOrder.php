<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TailorOrder extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['reference_path'];

    protected $appends = ['has_reference'];

    protected function casts(): array
    {
        return ['measurements' => 'array', 'estimate' => 'integer', 'final_price' => 'integer', 'paid_at' => 'datetime', 'requested_date' => 'date:Y-m-d', 'due_date' => 'date:Y-m-d'];
    }

    public function getHasReferenceAttribute(): bool
    {
        return ! empty($this->reference_path);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(TailorEvent::class);
    }
}
