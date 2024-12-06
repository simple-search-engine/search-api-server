import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const config = require('../config.js')

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(3000, config.HOST_IP);
}
bootstrap();