import { Module } from '@nestjs/common';
import { ServiceModule } from '@shared/service';
import { SensorController } from './sensor/sensor.controller';
import { SwitchController } from './switch/switch.controller';

@Module({
    imports: [
        ServiceModule
    ],
    controllers: [
        SensorController,
        SwitchController
    ]
})
export class ClientModule {
}
