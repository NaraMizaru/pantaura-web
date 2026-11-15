<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ModerationStatus;
use App\Models\Incident;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'incident_id' => Incident::factory(),
            'user_id' => User::factory(),
            'description' => fake()->sentence(14),
            'latitude' => fake()->latitude(-6.28, -6.12),
            'longitude' => fake()->longitude(106.75, 106.92),
            'submitted_at' => now(),
            'moderation_status' => ModerationStatus::Pending,
        ];
    }
}
