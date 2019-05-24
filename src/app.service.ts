import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { HostService } from '@shared/service';

@Injectable()
export class AppService implements OnModuleInit, OnApplicationShutdown {

    constructor(private hostService: HostService) {
    }

    async onModuleInit() {
        return this.hostService.setHostOnline().toPromise();
    }

    async onApplicationShutdown() {
        return this.hostService.setHostOffline()
            .toPromise();
    }
}
