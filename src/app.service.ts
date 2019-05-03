import { ConfigService } from '@config';
import { HttpService, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { getOwnHostname, getOwnIp } from '@shared/helpers';
import { HostModel } from '@shared/models';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

    currentHost: HostModel;

    constructor(private httpService: HttpService,
                private configService: ConfigService) {
    }

    onApplicationBootstrap(): void {
        const host = {
            hostname: getOwnHostname(),
            name: this.configService.get('name'),
            ip: getOwnIp(),
            port: this.configService.get('port')
        };

        this.httpService.post<HostModel>(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/host`, host)
            .subscribe(result => {
                this.currentHost = result.data;
            });
    }

    async onApplicationShutdown(signal: string) {
        return this.httpService.post<HostModel>(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/host/${getOwnIp()}/status`, {status: 'offline'})
            .toPromise();
    }
}
