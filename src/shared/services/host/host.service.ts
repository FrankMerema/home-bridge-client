import { ConfigService } from '@config';
import { Global, HttpService, Injectable } from '@nestjs/common';
import { errorHandler, getOwnHostname, getOwnIp } from '@shared/helpers';
import { HostModel } from '@shared/models';
import { Observable } from 'rxjs';
import { delay, map, retryWhen, tap } from 'rxjs/operators';

@Global()
@Injectable()
export class HostService {

    currentHost: HostModel;

    constructor(private httpService: HttpService,
                private configService: ConfigService) {
    }

    setHostOnline(): Observable<HostModel> {
        const host = {
            hostname: getOwnHostname(),
            name: this.configService.get('name'),
            ip: getOwnIp(),
            port: parseInt(this.configService.get('port'), 10)
        };

        return this.httpService.post<HostModel>(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/host`, host)
            .pipe(retryWhen(errors =>
                errors.pipe(
                    tap(errorHandler),
                    delay(2000))
            ), map(({data}) => {
                this.currentHost = data;
                return data;
            }));
    }

    setHostOffline(): Observable<any> {
        return this.httpService.post<HostModel>(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/host/${getOwnIp()}/status`, {status: 'offline'});
    }
}
