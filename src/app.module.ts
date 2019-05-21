import { Module } from '@nestjs/common';
import { ServiceModule } from '@shared/service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ServiceModule.forRoot()
    ],
    controllers: [
        AppController
    ],
    providers: [
        AppService
    ]
})
export class AppModule {
}
