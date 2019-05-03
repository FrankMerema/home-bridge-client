import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as RateLimit from 'express-rate-limit';
import * as session from 'express-session';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

const config = require('../service.config.json');

async function bootstrap() {
    const port = config.serverPort || 3000;

    const app = await NestFactory.create(AppModule);
    // Global prefix
    app.setGlobalPrefix('api');

    // Security
    app.enableCors();
    app.use(helmet());
    app.use(new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }));

    // Cookies and sessions
    app.use(cookieParser());
    app.use(session({
        secret: config.applicationSecret,
        resave: false,
        saveUninitialized: false
    }));

    // Listen to the shutdown of the application, for setting this host offline
    app.enableShutdownHooks();

    await app.listen(port);
}

bootstrap();
