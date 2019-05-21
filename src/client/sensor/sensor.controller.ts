import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SensorModel, State } from '@shared/models';
import { SensorService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('sensor')
export class SensorController {

    constructor(private sensorService: SensorService) {
    }

    @Get('/state/:pin')
    getStateOfSensor(@Param('pin') pin: number): Observable<State> {
        return this.sensorService.getStateOfSensor(pin);
    }

    @Post()
    addSensor(@Body() pin: number): Observable<SensorModel> {
        return this.sensorService.addSensor(pin);
    }

    @Delete('/:pin')
    deleteSensor(@Param('pin') pin: number): Observable<null> {
        return this.sensorService.deleteSensor(pin);
    }
}
