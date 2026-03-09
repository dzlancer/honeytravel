import {
  Controller, Get, Put, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemConfigService } from './system-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('system-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('system-config')
export class SystemConfigController {
  constructor(private configService: SystemConfigService) {}

  @Get()
  @ApiOperation({ summary: 'List all system configurations' })
  async getAll(@Query('category') category?: string) {
    return this.configService.getAll(category);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update a system configuration value' })
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
    @Request() req: any,
  ) {
    return this.configService.set(
      key,
      dto.value,
      req.user.sub,
      req.user.email,
    );
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get configuration audit logs' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entityType') entityType?: string,
  ) {
    return this.configService.getAuditLogs(
      page || 1,
      Math.min(limit || 20, 100),
      entityType,
    );
  }
}
