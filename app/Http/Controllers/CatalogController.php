<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        return Inertia::render('Home', ['services' => Service::orderBy('id')->get()]);
    }

    public function booking(Service $service)
    {
        return Inertia::render('Booking', ['service' => $service, 'minDate' => now()->addDays($service->lead_days)->toDateString()]);
    }
}
