import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

    @Get()
    status(): { status: string } {
        return {status: 'OK'};
    }
}
