<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ResolutionStatus;
use App\Models\Incident;
use App\Models\ResolutionSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResolutionSubmission>
 */
class ResolutionSubmissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'incident_id' => Incident::factory()->verified(),
            'user_id' => User::factory(),
            'description' => 'Air sudah surut dan jalan dapat dilalui kembali.',
            'status' => ResolutionStatus::Pending,
        ];
    }
}
