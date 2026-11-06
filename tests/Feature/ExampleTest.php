<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_shows_seeded_services(): void
    {
        $this->withoutVite();
        $this->seed();
        $this->get('/')->assertInertia(fn ($p) => $p->component('Home')->has('services', 3));
    }
}
