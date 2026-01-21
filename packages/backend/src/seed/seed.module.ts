import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';

@Module({
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
