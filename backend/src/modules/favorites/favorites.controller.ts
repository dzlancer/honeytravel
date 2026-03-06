import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../bookings/entities/booking.entity';

class AddFavoriteDto {
  @ApiProperty() @IsString() productType: ProductType;
  @ApiProperty() @IsString() productId: string;
}

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add to favorites' })
  async add(@CurrentUser('id') userId: string, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(userId, dto.productType, dto.productId);
  }

  @Delete(':productType/:productId')
  @ApiOperation({ summary: 'Remove from favorites' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('productType') productType: string,
    @Param('productId') productId: string,
  ) {
    await this.favoritesService.remove(userId, productType, productId);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'List favorites' })
  @ApiQuery({ name: 'type', required: false })
  async list(@CurrentUser('id') userId: string, @Query('type') type?: string) {
    return this.favoritesService.findByUser(userId, type);
  }

  @Get('check/:productType/:productId')
  @ApiOperation({ summary: 'Check if favorited' })
  async check(
    @CurrentUser('id') userId: string,
    @Param('productType') productType: string,
    @Param('productId') productId: string,
  ) {
    const isFavorited = await this.favoritesService.isFavorited(userId, productType, productId);
    return { isFavorited };
  }
}
