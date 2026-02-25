<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Products';
    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Product Details')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\Select::make('type')
                        ->options([
                            'excursion' => 'Excursion',
                            'transfer' => 'Airport Transfer',
                            'pass' => 'Istanbul Pass',
                            'cruise' => 'Dinner Cruise',
                            'other' => 'Other',
                        ])
                        ->required(),
                    Forms\Components\Toggle::make('is_active')->default(true),
                    Forms\Components\TextInput::make('title')->required()->maxLength(255),
                    Forms\Components\TextInput::make('title_fr')->label('Title (FR)')->maxLength(255),
                    Forms\Components\TextInput::make('duration')->maxLength(50),
                ]),
                Forms\Components\Textarea::make('description')->rows(3)->columnSpanFull(),
                Forms\Components\Textarea::make('description_fr')->label('Description (FR)')->rows(3)->columnSpanFull(),
            ]),

            Forms\Components\Section::make('Pricing')->schema([
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('price_dzd')->label('Price (DZD)')->numeric()->prefix('DZD')->required(),
                    Forms\Components\TextInput::make('price_eur')->label('Price (EUR)')->numeric()->prefix('€'),
                    Forms\Components\TextInput::make('cost_dzd')->label('Cost (DZD)')->numeric()->prefix('DZD'),
                ]),
            ]),

            Forms\Components\Section::make('Supplier')->schema([
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('supplier_name')->maxLength(255),
                    Forms\Components\TextInput::make('supplier_contact')->maxLength(255),
                    Forms\Components\TextInput::make('supplier_commission')->numeric()->suffix('%'),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('type')->badge()->sortable(),
                Tables\Columns\TextColumn::make('title')->searchable()->sortable()->limit(40),
                Tables\Columns\TextColumn::make('price_dzd')->label('Price')->money('DZD')->sortable(),
                Tables\Columns\TextColumn::make('duration')->sortable(),
                Tables\Columns\TextColumn::make('supplier_name')->label('Supplier')->sortable(),
                Tables\Columns\TextColumn::make('supplier_commission')->label('Commission')->suffix('%'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'excursion' => 'Excursion',
                        'transfer' => 'Transfer',
                        'pass' => 'Pass',
                        'cruise' => 'Cruise',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
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
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->withoutGlobalScopes([SoftDeletingScope::class]);
    }
}
