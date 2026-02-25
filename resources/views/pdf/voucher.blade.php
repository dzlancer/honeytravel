<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Voucher {{ $booking->reference }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0; opacity: 0.9; }
        .reference { background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; margin-top: 15px; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; color: #d97706; border-bottom: 2px solid #f59e0b; padding-bottom: 5px; margin-bottom: 15px; }
        .info-grid { display: table; width: 100%; }
        .info-row { display: table-row; }
        .info-label { display: table-cell; padding: 8px 10px; color: #666; width: 40%; }
        .info-value { display: table-cell; padding: 8px 10px; font-weight: 600; }
        .total-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; text-align: center; margin-top: 20px; }
        .total-box .amount { font-size: 32px; font-weight: bold; color: #d97706; }
        .total-box .currency { font-size: 14px; color: #666; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        .footer .contact { color: #d97706; font-weight: bold; }
        .qr-note { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HONEY TRAVEL ISTANBUL</h1>
        <p>Votre Partenaire de Voyage</p>
        <div class="reference">{{ $booking->reference }}</div>
    </div>

    <div class="section">
        <div class="section-title">DETAILS DE L'HOTEL</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Hotel</div>
                <div class="info-value">{{ $booking->hotel->name ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">District</div>
                <div class="info-value">{{ $booking->hotel->district ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Adresse</div>
                <div class="info-value">{{ $booking->hotel->address ?? 'Istanbul, Turquie' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Etoiles</div>
                <div class="info-value">{{ str_repeat('★', $booking->hotel->star_rating ?? 3) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DETAILS DU SEJOUR</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Check-in</div>
                <div class="info-value">{{ $booking->check_in ? $booking->check_in->format('d/m/Y') : 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Check-out</div>
                <div class="info-value">{{ $booking->check_out ? $booking->check_out->format('d/m/Y') : 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Nuits</div>
                <div class="info-value">{{ $booking->nights }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Chambres</div>
                <div class="info-value">{{ $booking->rooms }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Voyageurs</div>
                <div class="info-value">{{ $booking->guests }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">VOYAGEUR</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nom complet</div>
                <div class="info-value">{{ $booking->customer->full_name ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">WhatsApp</div>
                <div class="info-value">{{ $booking->customer->whatsapp ?? 'N/A' }}</div>
            </div>
            @if($booking->customer && $booking->customer->email)
            <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">{{ $booking->customer->email }}</div>
            </div>
            @endif
        </div>
    </div>

    <div class="total-box">
        <div class="amount">{{ number_format($booking->total_dzd, 0, ',', ' ') }} DZD</div>
        <div class="currency">({{ number_format($booking->total_eur, 0, ',', ' ') }} EUR)</div>
        <div style="margin-top: 10px; font-size: 14px; color: #666;">Paiement: {{ ucfirst($booking->payment_method) }}</div>
    </div>

    <div class="footer">
        <p>Ce voucher est votre confirmation de reservation. Presentez-le a l'hotel lors de votre arrivee.</p>
        <p class="contact">
            WhatsApp: +213 549 591 903 | Email: contact@honeytravelcheraga.com
        </p>
        <p>Honey Travel Istanbul Gateway - Cheraga, Alger, Algerie</p>
        <p style="margin-top: 10px;">Genere le {{ now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>
