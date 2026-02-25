<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\Booking;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Bookings';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'reference';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Booking Details')->schema([
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('reference')
                        ->disabled()
                        ->dehydrated(false),
                    Forms\Components\Select::make('status')
                        ->options([
                            'pending' => 'Pending',
                            'confirmed' => 'Confirmed',
                            'paid' => 'Paid',
                            'cancelled' => 'Cancelled',
                            'completed' => 'Completed',
                            'no_show' => 'No Show',
                        ])
                        ->required(),
                    Forms\Components\Select::make('payment_status')
                        ->options([
                            'unpaid' => 'Unpaid',
                            'partial' => 'Partial',
                            'paid' => 'Paid',
                            'refunded' => 'Refunded',
                        ])
                        ->required(),
                ]),
            ]),

            Forms\Components\Section::make('Guest & Hotel')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\Select::make('customer_id')
                        ->relationship('customer', 'full_name')
                        ->searchable()
                        ->preload()
                        ->required(),
                    Forms\Components\Select::make('hotel_id')
                        ->relationship('hotel', 'name')
                        ->searchable()
                        ->preload()
                        ->required(),
                    Forms\Components\Select::make('variant_id')
                        ->relationship('variant', 'variant_id')
                        ->searchable()
                        ->preload(),
                    Forms\Components\Select::make('payment_method')
                        ->options([
                            'cib' => 'CIB/D17',
                            'baridimob' => 'BaridiMob',
                            'cash' => 'Cash',
                            'reserve' => 'Reserve & Pay Later',
                        ]),
                ]),
            ]),

            Forms\Components\Section::make('Dates & Guests')->schema([
                Forms\Components\Grid::make(4)->schema([
                    Forms\Components\DatePicker::make('check_in')->required(),
                    Forms\Components\DatePicker::make('check_out')->required(),
                    Forms\Components\TextInput::make('nights')->numeric()->default(4),
                    Forms\Components\TextInput::make('guests')->numeric()->default(2),
                    Forms\Components\TextInput::make('rooms')->numeric()->default(1),
                    Forms\Components\Select::make('channel')
                        ->options([
                            'website' => 'Website',
                            'whatsapp' => 'WhatsApp',
                            'instagram' => 'Instagram',
                            'facebook' => 'Facebook',
                            'tiktok' => 'TikTok',
                            'phone' => 'Phone',
                            'walk_in' => 'Walk-in',
                        ])
                        ->default('website'),
                ]),
            ]),

            Forms\Components\Section::make('Pricing')->schema([
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('total_dzd')
                        ->label('Total (DZD)')
                        ->numeric()
                        ->prefix('DZD'),
                    Forms\Components\TextInput::make('total_eur')
                        ->label('Total (EUR)')
                        ->numeric()
                        ->prefix('€'),
                    Forms\Components\TextInput::make('paid_amount_dzd')
                        ->label('Paid (DZD)')
                        ->numeric()
                        ->prefix('DZD'),
                ]),
            ]),

            Forms\Components\Section::make('Notes')->schema([
                Forms\Components\Textarea::make('internal_notes')
                    ->rows(3)
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('cancellation_reason')
                    ->rows(2)
                    ->columnSpanFull()
                    ->visible(fn ($get) => $get('status') === 'cancelled'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('customer.full_name')
                    ->label('Customer')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('hotel.name')
                    ->label('Hotel')
                    ->limit(20)
                    ->sortable(),
                Tables\Columns\TextColumn::make('check_in')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('nights')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => fn ($state) => in_array($state, ['confirmed', 'paid', 'completed']),
                        'danger' => fn ($state) => in_array($state, ['cancelled', 'no_show']),
                    ]),
                Tables\Columns\BadgeColumn::make('payment_status')
                    ->colors([
                        'danger' => 'unpaid',
                        'warning' => 'partial',
                        'success' => 'paid',
                        'gray' => 'refunded',
                    ]),
                Tables\Columns\TextColumn::make('total_dzd')
                    ->label('Total')
                    ->money('DZD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('channel')
                    ->badge()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'paid' => 'Paid',
                        'cancelled' => 'Cancelled',
                        'completed' => 'Completed',
                    ]),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->options([
                        'unpaid' => 'Unpaid',
                        'partial' => 'Partial',
                        'paid' => 'Paid',
                    ]),
                Tables\Filters\SelectFilter::make('channel')
                    ->options([
                        'website' => 'Website',
                        'whatsapp' => 'WhatsApp',
                        'instagram' => 'Instagram',
                    ]),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('confirm')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Booking $record) => $record->status === 'pending')
                    ->action(fn (Booking $record) => $record->update(['status' => 'confirmed'])),
                Tables\Actions\Action::make('cancel')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (Booking $record) => !in_array($record->status, ['cancelled', 'completed']))
                    ->form([
                        Forms\Components\Textarea::make('cancellation_reason')->required(),
                    ])
                    ->action(fn (Booking $record, array $data) => $record->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => $data['cancellation_reason'],
                    ])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([SoftDeletingScope::class]);
    }
}
