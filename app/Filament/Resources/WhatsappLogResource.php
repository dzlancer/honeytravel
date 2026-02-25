<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WhatsappLogResource\Pages;
use App\Models\WhatsappLog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WhatsappLogResource extends Resource
{
    protected static ?string $model = WhatsappLog::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationGroup = 'Bookings';
    protected static ?int $navigationSort = 6;
    protected static ?string $navigationLabel = 'WhatsApp Logs';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(2)->schema([
                Forms\Components\Select::make('booking_id')
                    ->relationship('booking', 'reference')
                    ->searchable(),
                Forms\Components\Select::make('customer_id')
                    ->relationship('customer', 'full_name')
                    ->searchable(),
                Forms\Components\Select::make('direction')
                    ->options(['inbound' => 'Inbound', 'outbound' => 'Outbound'])
                    ->required(),
                Forms\Components\Select::make('message_type')
                    ->options(['text' => 'Text', 'template' => 'Template', 'media' => 'Media'])
                    ->default('text'),
                Forms\Components\Select::make('status')
                    ->options(['sent' => 'Sent', 'delivered' => 'Delivered', 'read' => 'Read', 'failed' => 'Failed', 'demo' => 'Demo']),
                Forms\Components\TextInput::make('template_name'),
            ]),
            Forms\Components\Textarea::make('content')->rows(4)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('booking.reference')->label('Booking')->searchable(),
                Tables\Columns\TextColumn::make('customer.full_name')->label('Customer')->searchable(),
                Tables\Columns\BadgeColumn::make('direction')
                    ->colors(['success' => 'outbound', 'info' => 'inbound']),
                Tables\Columns\TextColumn::make('message_type')->badge(),
                Tables\Columns\TextColumn::make('content')->limit(50),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => fn ($state) => in_array($state, ['delivered', 'read']),
                        'warning' => 'sent',
                        'danger' => 'failed',
                        'gray' => 'demo',
                    ]),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('direction')
                    ->options(['inbound' => 'Inbound', 'outbound' => 'Outbound']),
                Tables\Filters\SelectFilter::make('status')
                    ->options(['sent' => 'Sent', 'delivered' => 'Delivered', 'read' => 'Read', 'failed' => 'Failed']),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWhatsappLogs::route('/'),
        ];
    }
}
