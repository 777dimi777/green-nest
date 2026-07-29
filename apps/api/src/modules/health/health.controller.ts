import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and database health' })
  @ApiOkResponse({
    description: 'The API is running and the database is connected.',
  })
  @ApiServiceUnavailableResponse({
    description: 'The API is running, but the database is unavailable.',
  })
  check() {
    return this.healthService.check();
  }
}
