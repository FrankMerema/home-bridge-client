import { HttpService, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { HostService } from '@shared/service';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

    constructor(private httpService: HttpService,
                private hostService: HostService) {
    }

    onApplicationBootstrap(): void {
        this.hostService.setHostOnline();
    }

    async onApplicationShutdown(signal: string) {
        return this.hostService.setHostOffline()
            .toPromise();
    }
}
