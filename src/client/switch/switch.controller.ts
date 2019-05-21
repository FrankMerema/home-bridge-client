import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { State, SwitchModel } from '@shared/models';
import { SwitchService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('switch')
export class SwitchController {

    constructor(private switchService: SwitchService) {
    }

    @Get('/state/:pin')
    getStateOfSwitch(@Param('pin') pin: number): Observable<number> {
        return this.switchService.getStateOfSwitch(pin);
    }

    @Post()
    addSwitch(@Body() pin: number): Observable<SwitchModel> {
        return this.switchService.addNewSwitch(pin);
    }

    @Post('/state/:pin')
    changeStateOfSwitch(@Body() state: State, @Param('pin') pin: number): Observable<void> {
        return this.switchService.changeState(pin, state);
    }

    @Delete('/:pin')
    deleteSwitch(@Param('pin') pin: number): Observable<null> {
        return this.switchService.deleteSwitch(pin);
    }
}
