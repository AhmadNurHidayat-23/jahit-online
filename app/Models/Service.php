<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['name', 'description', 'price', 'lead_days', 'image'];

    protected function casts(): array
    {
        return ['price' => 'integer', 'lead_days' => 'integer'];
    }

    public function orders()
    {
        return $this->hasMany(TailorOrder::class);
    }
}
