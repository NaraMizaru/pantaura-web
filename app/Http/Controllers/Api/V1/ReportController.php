<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\DisasterType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreAdditionalReportRequest;
use App\Http\Requests\Api\V1\StoreReportRequest;
use App\Http\Resources\Api\V1\ReportResource;
use App\Models\Incident;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    public function store(StoreReportRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();
        /** @var array<int, UploadedFile> $files */
        $files = $request->file('media', []);

        $report = $this->reportService->createInitialReport(
            $user,
            [
                'latitude' => (float) $validated['latitude'],
                'longitude' => (float) $validated['longitude'],
                'description' => (string) $validated['description'],
                'address' => isset($validated['address']) ? (string) $validated['address'] : null,
                'disaster_type' => isset($validated['disaster_type'])
                    ? DisasterType::from((string) $validated['disaster_type'])
                    : DisasterType::Flood,
            ],
            $files,
        );

        return response()->json([
            'message' => 'Laporan bencana berhasil dikirim.',
            'data' => new ReportResource($report),
        ], 201);
    }

    public function myReports(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        $reports = $user->reports()
            ->with(['incident', 'media'])
            ->latest('submitted_at')
            ->paginate(15);

        return ReportResource::collection($reports);
    }

    public function storeAdditional(StoreAdditionalReportRequest $request, Incident $incident): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();
        /** @var array<int, UploadedFile> $files */
        $files = $request->file('media', []);

        try {
            $report = $this->reportService->addReportToIncident(
                $user,
                $incident,
                [
                    'latitude' => (float) $validated['latitude'],
                    'longitude' => (float) $validated['longitude'],
                    'description' => (string) $validated['description'],
                ],
                $files,
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Laporan tambahan berhasil ditambahkan ke insiden.',
            'data' => new ReportResource($report),
        ], 201);
    }
}
