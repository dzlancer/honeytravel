<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HotelResource\Pages;
use App\Models\Hotel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class HotelResource extends Resource
{
    protected static ?string $model = Hotel::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = 'Hotels';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Hotel')->tabs([
                Forms\Components\Tabs\Tab::make('General')->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('hotel_id')
                            ->label('Hotel ID')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(10)
                            ->placeholder('HT0001'),
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, Forms\Set $set) =>
                                $set('slug', \Illuminate\Support\Str::slug($state))
                            ),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\Select::make('star_rating')
                            ->options([1 => '1 Star', 2 => '2 Stars', 3 => '3 Stars', 4 => '4 Stars', 5 => '5 Stars'])
                            ->default(3)
                            ->required(),
                        Forms\Components\Select::make('district')
                            ->options([
                                'Laleli' => 'Laleli', 'Fatih' => 'Fatih', 'Sultanahmet' => 'Sultanahmet',
                                'Taksim' => 'Taksim', 'Beyazit' => 'Beyazit', 'Sisli' => 'Sisli',
                                'Yenikapi' => 'Yenikapi', 'Aksaray' => 'Aksaray',
                                'Istanbul Centre' => 'Istanbul Centre',
                            ])
                            ->searchable()
                            ->required(),
                        Forms\Components\TextInput::make('address')->maxLength(255),
                    ]),
                    Forms\Components\RichEditor::make('description')
                        ->label('Description (English)')
                        ->columnSpanFull(),
                    Forms\Components\RichEditor::make('description_fr')
                        ->label('Description (Francais)')
                        ->columnSpanFull(),
                    Forms\Components\RichEditor::make('description_ar')
                        ->label('Description (Arabic)')
                        ->columnSpanFull(),
                ]),

                Forms\Components\Tabs\Tab::make('Pricing')->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('base_price_dzd')
                            ->label('Base Price (DZD)')
                            ->numeric()
                            ->prefix('DZD')
                            ->required(),
                        Forms\Components\TextInput::make('sale_price_dzd')
                            ->label('Sale Price (DZD)')
                            ->numeric()
                            ->prefix('DZD')
                            ->required(),
                        Forms\Components\TextInput::make('base_price_eur')
                            ->label('Base Price (EUR)')
                            ->numeric()
                            ->prefix('€'),
                        Forms\Components\TextInput::make('sale_price_eur')
                            ->label('Sale Price (EUR)')
                            ->numeric()
                            ->prefix('€'),
                    ]),
                ]),

                Forms\Components\Tabs\Tab::make('Location')->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('city')->default('Istanbul'),
                        Forms\Components\TextInput::make('country')->default('Turkey'),
                        Forms\Components\TextInput::make('latitude')->numeric(),
                        Forms\Components\TextInput::make('longitude')->numeric(),
                    ]),
                ]),

                Forms\Components\Tabs\Tab::make('Amenities & Images')->schema([
                    Forms\Components\TagsInput::make('amenities')
                        ->suggestions([
                            'WiFi gratuit', 'Climatisation', 'Petit-dejeuner inclus', 'Piscine',
                            'Spa', 'Room Service', 'Bar', 'Restaurant', 'Salle de sport',
                            'Parking', 'Reception 24h/24', 'Coffre-fort', 'TV satellite',
                            'Minibar', 'Blanchisserie', 'Navette aeroport',
                        ])
                        ->columnSpanFull(),
                    Forms\Components\Repeater::make('images')
                        ->schema([
                            Forms\Components\TextInput::make('url')
                                ->label('Image URL')
                                ->url()
                                ->required(),
                        ])
                        ->columnSpanFull()
                        ->defaultItems(0),
                    Forms\Components\SpatieMediaLibraryFileUpload::make('gallery')
                        ->collection('gallery')
                        ->multiple()
                        ->image()
                        ->maxSize(5120)
                        ->columnSpanFull(),
                ]),

                Forms\Components\Tabs\Tab::make('SEO')->schema([
                    Forms\Components\KeyValue::make('seo_meta')
                        ->keyLabel('Meta Key')
                        ->valueLabel('Meta Value')
                        ->addActionLabel('Add Meta Tag')
                        ->columnSpanFull(),
                ]),

                Forms\Components\Tabs\Tab::make('Contact & Settings')->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('contact_phone')
                            ->tel()
                            ->default('+213549591903'),
                        Forms\Components\TextInput::make('contact_email')
                            ->email()
                            ->default('contact@honeytravelcheraga.com'),
                        Forms\Components\TextInput::make('total_rooms')
                            ->numeric()
                            ->default(20),
                        Forms\Components\TextInput::make('available_rooms')
                            ->numeric()
                            ->default(15),
                        Forms\Components\Toggle::make('is_active')
                            ->default(true),
                        Forms\Components\Toggle::make('is_featured')
                            ->default(false),
                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0),
                    ]),
                ]),

                Forms\Components\Tabs\Tab::make('Variants')->schema([
                    Forms\Components\Repeater::make('variants')
                        ->relationship()
                        ->schema([
                            Forms\Components\Grid::make(3)->schema([
                                Forms\Components\TextInput::make('variant_id')
                                    ->required()
                                    ->unique(ignoreRecord: true),
                                Forms\Components\Select::make('nights')
                                    ->options([4 => '4 Nights', 6 => '6 Nights', 7 => '7 Nights'])
                                    ->required(),
                                Forms\Components\Toggle::make('is_active')->default(true),
                            ]),
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('base_price_dzd')
                                    ->numeric()
                                    ->prefix('DZD')
                                    ->required(),
                                Forms\Components\TextInput::make('sale_price_dzd')
                                    ->numeric()
                                    ->prefix('DZD')
                                    ->required(),
                            ]),
                        ])
                        ->columnSpanFull()
                        ->defaultItems(0)
                        ->addActionLabel('Add Variant'),
                ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('hotel_id')
                    ->label('ID')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('district')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('star_rating')
                    ->label('Stars')
                    ->sortable(),
                Tables\Columns\TextColumn::make('sale_price_dzd')
                    ->label('Price (DZD)')
                    ->money('DZD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('available_rooms')
                    ->label('Rooms')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean(),
                Tables\Columns\TextColumn::make('variants_count')
                    ->counts('variants')
                    ->label('Variants'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('district')
                    ->options(fn () => Hotel::query()->distinct()->pluck('district', 'district')->toArray()),
                Tables\Filters\SelectFilter::make('star_rating')
                    ->options([1 => '1', 2 => '2', 3 => '3', 4 => '4', 5 => '5']),
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\TernaryFilter::make('is_featured'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ])
            ->defaultSort('sort_order');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHotels::route('/'),
            'create' => Pages\CreateHotel::route('/create'),
            'edit' => Pages\EditHotel::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([SoftDeletingScope::class]);
    }
}
