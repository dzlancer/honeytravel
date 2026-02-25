<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CustomerResource\Pages;
use App\Models\Customer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CustomerResource extends Resource
{
    protected static ?string $model = Customer::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'CRM';
    protected static ?int $navigationSort = 3;
    protected static ?string $recordTitleAttribute = 'full_name';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Personal Information')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('full_name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('email')->email()->maxLength(255),
                    Forms\Components\TextInput::make('phone')->tel()->maxLength(20),
                    Forms\Components\TextInput::make('whatsapp')->tel()->maxLength(20),
                    Forms\Components\TextInput::make('city')->maxLength(100),
                    Forms\Components\TextInput::make('country')->default('Algeria'),
                    Forms\Components\TextInput::make('passport_number')->maxLength(50),
                    Forms\Components\TextInput::make('acquisition_channel')
                        ->maxLength(50),
                ]),
            ]),

            Forms\Components\Section::make('Social IDs')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('psid')->label('Facebook PSID'),
                    Forms\Components\TextInput::make('igid')->label('Instagram ID'),
                ]),
            ]),

            Forms\Components\Section::make('Loyalty & Tags')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\Toggle::make('is_vip')->label('VIP Customer'),
                    Forms\Components\TextInput::make('loyalty_points')->numeric()->default(0),
                    Forms\Components\TextInput::make('referral_code'),
                    Forms\Components\TextInput::make('referred_by'),
                ]),
                Forms\Components\TagsInput::make('tags')
                    ->suggestions(['VIP', 'Frequent', 'Group', 'Corporate', 'Honeymoon', 'Family', 'Budget', 'Luxury'])
                    ->columnSpanFull(),
                Forms\Components\KeyValue::make('preferences')
                    ->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('full_name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('whatsapp')
                    ->searchable(),
                Tables\Columns\TextColumn::make('city')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_vip')
                    ->boolean()
                    ->label('VIP'),
                Tables\Columns\TextColumn::make('bookings_count')
                    ->counts('bookings')
                    ->label('Bookings')
                    ->sortable(),
                Tables\Columns\TextColumn::make('acquisition_channel')
                    ->badge()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_vip')->label('VIP Only'),
                Tables\Filters\SelectFilter::make('country')
                    ->options(fn () => Customer::query()->distinct()->pluck('country', 'country')->toArray()),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListCustomers::route('/'),
            'create' => Pages\CreateCustomer::route('/create'),
            'edit' => Pages\EditCustomer::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([SoftDeletingScope::class]);
    }
}
