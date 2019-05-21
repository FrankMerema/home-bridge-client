import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class SensorService {

    constructor(private httpService: HttpService) {
    }
}
