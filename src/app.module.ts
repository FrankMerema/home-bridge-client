import { Module } from '@nestjs/common';
import { ServiceModule } from '@shared/service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client';

@Module({
    imports: [
        ClientModule,
        ServiceModule
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
