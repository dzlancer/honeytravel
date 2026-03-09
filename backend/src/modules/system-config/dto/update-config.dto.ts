import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty({ description: 'New value (JSON-encoded string)' })
  @IsNotEmpty()
  @IsString()
  value: string;
}
