<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrototypeInquiry;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PrototypeInquiryController extends Controller
{
    public function index(): Response
    {
        $inquiries = PrototypeInquiry::query()
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/prototype-inquiries/index', [
            'inquiries' => $inquiries,
            'unreadCount' => PrototypeInquiry::where('is_read', false)->count(),
        ]);
    }

    public function show(PrototypeInquiry $prototypeInquiry): Response
    {
        if (! $prototypeInquiry->is_read) {
            $prototypeInquiry->update(['is_read' => true]);
        }

        return Inertia::render('admin/prototype-inquiries/show', [
            'inquiry' => $prototypeInquiry,
        ]);
    }

    public function destroy(PrototypeInquiry $prototypeInquiry): RedirectResponse
    {
        $prototypeInquiry->delete();

        return redirect()->route('admin.prototype-inquiries.index');
    }
}
