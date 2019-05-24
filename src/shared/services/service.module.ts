import { ConfigModule } from '@config';
import { Global, HttpModule, Module } from '@nestjs/common';
import { HostService } from './host/host.service';
import { SensorService } from './sensor/sensor.service';
import { SwitchService } from './switch/switch.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        HttpModule
    ],
    providers: [
        HostService,
        SensorService,
        SwitchService
    ],
    exports: [
        HostService,
        SensorService,
        SwitchService
    ]
})
export class ServiceModule {
}
