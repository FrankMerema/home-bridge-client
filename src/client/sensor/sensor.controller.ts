import { Controller } from '@nestjs/common';
import { SensorService } from '@shared/service';

@Controller('sensor')
export class SensorController {

    constructor(private sensorService: SensorService) {
    }
}
