import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/decorator/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async check() {
    const googleStatus = await this.healthService.checkGoogle();
    const clovaStatus = await this.healthService.checkClova();

    return {
      status: 'ok',
      external: {
        google: googleStatus ? 'up' : 'down',
        clova: clovaStatus ? 'up' : 'down',
      },
    };
  }
}
