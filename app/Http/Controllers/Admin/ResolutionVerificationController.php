<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\ResolutionStatus;
use App\Http\Controllers\Controller;
use App\Models\ResolutionSubmission;
use App\Models\User;
use App\Services\ResolutionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class ResolutionVerificationController extends Controller
{
    public function __construct(
        private readonly ResolutionService $resolutionService,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $activeStatus = is_string($status) && ResolutionStatus::tryFrom($status) !== null ? $status : null;

        $resolutions = ResolutionSubmission::query()
            ->with(['incident:id,title,address,status', 'submitter:id,name', 'media'])
            ->when($activeStatus !== null, fn ($q) => $q->where('status', $activeStatus))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ResolutionSubmission $res): array => [
                'id' => $res->id,
                'description' => $res->description,
                'status' => $res->status->value,
                'rejection_reason' => $res->rejection_reason,
                'created_at' => $res->created_at?->toIso8601String(),
                'submitter_name' => $res->submitter->name ?? 'Warga',
                'incident' => [
                    'id' => $res->incident->id,
                    'title' => $res->incident->title,
                    'address' => $res->incident->address,
                    'status' => $res->incident->status->value,
                ],
                'media' => $res->media->map(fn ($m): array => [
                    'id' => $m->id,
                    'url' => $m->url(),
                    'file_type' => $m->file_type->value,
                    'original_filename' => $m->original_filename,
                ]),
            ]);

        return Inertia::render('admin/resolutions/index', [
            'resolutions' => $resolutions,
            'activeStatus' => $activeStatus,
        ]);
    }

    public function approve(Request $request, ResolutionSubmission $resolution): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        try {
            $this->resolutionService->approveResolution($resolution, $admin);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Penyelesaian insiden disetujui.');
    }

    public function reject(Request $request, ResolutionSubmission $resolution): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        /** @var User $admin */
        $admin = $request->user();

        try {
            $this->resolutionService->rejectResolution($resolution, $admin, (string) $validated['reason']);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Pengajuan penyelesaian ditolak.');
    }
}
