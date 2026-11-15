<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Incident>
 */
class IncidentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => 'Genangan Air '.fake()->streetName(),
            'description' => fake()->sentence(12),
            'latitude' => fake()->latitude(-6.28, -6.12),
            'longitude' => fake()->longitude(106.75, 106.92),
            'address' => fake()->streetAddress().', Jakarta',
            'status' => IncidentStatus::Unverified,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IncidentStatus::Verified,
            'verified_at' => now(),
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IncidentStatus::Resolved,
            'verified_at' => now()->subHours(4),
            'resolved_at' => now(),
        ]);
    }
}
