<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Symfony\Component\Yaml\Yaml;

it('renders the swagger ui page for api docs', function (): void {
    $response = $this->get(route('api.docs'));

    $response->assertOk();
    $response->assertSee('SiagaKita REST API Documentation');
    $response->assertSee('/docs/openapi.yaml');
});

it('provides a complete openapi 3 specification for all v1 endpoints', function (): void {
    $specPath = public_path('docs/openapi.yaml');

    expect(File::exists($specPath))->toBeTrue();

    $spec = File::get($specPath);
    $parsed = Yaml::parse($spec);

    expect($parsed)
        ->toBeArray()
        ->and($parsed['openapi'] ?? null)->toBe('3.0.3')
        ->and($parsed['paths'] ?? [])->toHaveKeys([
            '/auth/register',
            '/auth/login',
            '/auth/logout',
            '/auth/me',
            '/incidents',
            '/incidents/map',
            '/incidents/{incident}',
            '/reports',
            '/reports/my',
            '/incidents/{incident}/reports',
            '/incidents/{incident}/resolutions',
        ]);
});
