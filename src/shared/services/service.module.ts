import { ConfigModule } from '@config';
import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { HostService } from './host/host.service';
import { SensorService } from './sensor/sensor.service';
import { SwitchService } from './switch/switch.service';

@Module({
    imports: [
        ConfigModule,
        HttpModule
    ]
})
export class ServiceModule {
    static forRoot(): DynamicModule {
        return {
            module: ServiceModule,
            providers: [HostService],
            exports: [HostService]
        };
    }

    static forChild(): DynamicModule {
        return {
            module: ServiceModule,
            providers: [
                SensorService,
                SwitchService
            ],
            exports: [
                SensorService,
                SwitchService
            ]
        };
    }
}
