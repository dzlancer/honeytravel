import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Hotel } from './entities/hotel.entity';
import { SupplierRegistryService } from './supplier-registry.service';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Hotel])],
  controllers: [SuppliersController],
  providers: [SupplierRegistryService, SuppliersService],
  exports: [SupplierRegistryService, SuppliersService],
})
export class SuppliersModule {}
