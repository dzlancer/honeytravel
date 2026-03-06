import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewsService } from './reviews.service';
import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../bookings/entities/booking.entity';

class CreateReviewDto {
  @ApiProperty() @IsString() productType: ProductType;
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) rating: number;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() comment: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() images?: string[];
}

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a review' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto);
  }

  @Public()
  @Get('product/:type/:id')
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getProductReviews(
    @Param('type') type: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.findByProduct(type, id, page || 1, limit || 10);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my reviews' })
  async getMyReviews(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
  ) {
    return this.reviewsService.findByUser(userId, page || 1);
  }

  @Patch(':id/helpful')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark review as helpful' })
  async markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete own review' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reviewsService.delete(id, userId);
  }
}
