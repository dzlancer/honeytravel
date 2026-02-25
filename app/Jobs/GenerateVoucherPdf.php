<?php

namespace App\Jobs;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateVoucherPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public Booking $booking
    ) {}

    public function handle(): void
    {
        try {
            $html = view('pdf.voucher', ['booking' => $this->booking->load(['hotel', 'customer', 'variant'])])->render();

            $pdf = app('dompdf.wrapper');
            $pdf->loadHTML($html);
            $pdfContent = $pdf->output();

            $path = "vouchers/{$this->booking->reference}.pdf";
            Storage::disk('public')->put($path, $pdfContent);

            $this->booking->update(['voucher_path' => $path]);

            Log::info('Voucher PDF generated', ['booking' => $this->booking->reference, 'path' => $path]);
        } catch (\Throwable $e) {
            Log::error('Voucher PDF generation failed', [
                'booking' => $this->booking->reference,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
