<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['Kemeja personal', 'Garis bersih, ukuran tepat. Kemeja untuk keseharian dan momen penting.', 250000, 7, 'shirt.jpg'], ['Dress pilihan', 'Siluet yang mengikuti Anda, dengan detail sesuai karakter pribadi.', 450000, 10, 'dress.jpg'], ['Setelan berkarakter', 'Potongan terukur untuk tampilan yang tenang dan percaya diri.', 750000, 14, 'suit.jpg']] as [$name,$description,$price,$lead_days,$image]) {
            Service::firstOrCreate(compact('name'), compact('description', 'price', 'lead_days') + ['image' => '/images/'.$image]);
        }
    }
}
