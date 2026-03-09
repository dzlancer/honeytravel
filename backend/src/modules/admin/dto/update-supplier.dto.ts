import { IsOptional, IsBoolean, IsString, IsNumber, IsObject, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'Plain-text credentials object (will be encrypted)' })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  markupPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeout?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
