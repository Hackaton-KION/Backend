import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import * as validatorPackage from 'class-validator';
import * as transformerPackage from 'class-transformer';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database';
import { STATIC_DIR_PATH } from './const';

async function bootstrap() {
	const { PORT, } = process.env;
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	const directories = [
		fs.mkdir(path.join(STATIC_DIR_PATH, 'images'), { recursive: true, }),
		fs.mkdir(path.join(STATIC_DIR_PATH, 'manifests'), { recursive: true, }),
		fs.mkdir(path.join(STATIC_DIR_PATH, 'videos'), { recursive: true, })
	];
	await Promise.all(directories);

	const prismaService = app.get(DatabaseService);
	await prismaService.enableShutdownHooks(app);

	app.use(cookieParser());
	app.enableCors({
		credentials: true,
		origin: (_, cb) => cb(null, true),
	});
	app.useGlobalPipes(
		new ValidationPipe({
			validatorPackage,
			transformerPackage,
			forbidUnknownValues: false,
		})
	);

	app.setGlobalPrefix('api');

	const config = new DocumentBuilder()
		.setTitle('Документация по API сервера "Task manager"')
		.setDescription('Документация по API приложения дел')
		.setVersion('1.0.0')
		.addCookieAuth(process.env.COOKIE_NAME)
		.addBearerAuth()
		.addServer(`http://localhost:${PORT}`)
		.addTag('api')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	/**
	 * Для преобразования BigInt в JSON
	 */
	(BigInt.prototype as any).toJSON = function () {
		return Number(this);
	};

	await app.listen(PORT, () => {
		console.log(`server start PORT: ${PORT}`);
	});
}
bootstrap();
