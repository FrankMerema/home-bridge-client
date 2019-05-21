import { ConfigService } from '@config';
import { HttpService, Injectable } from '@nestjs/common';
import { errorHandler, getOwnHostname, getOwnIp } from '@shared/helpers';
import { HostModel } from '@shared/models';
import { Observable } from 'rxjs';

@Injectable()
export class HostService {

    currentHost: HostModel;

    constructor(private httpService: HttpService,
                private configService: ConfigService) {
    }

    setHostOnline(): void {
        const host = {
            hostname: getOwnHostname(),
            name: this.configService.get('name'),
            ip: getOwnIp(),
            port: this.configService.get('port')
        };

        this.httpService.post<HostModel>(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/host`, host)
            .subscribe(result => {
                this.currentHost = result.data;
            }, error => {
                errorHandler(error);
                setTimeout(() => this.setHostOnline(), 2000);
            });
    }

    setHostOffline(): Observable<any> {
        return this.httpService.post<HostModel>(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/host/${getOwnIp()}/status`, {status: 'offline'});
    }
}
