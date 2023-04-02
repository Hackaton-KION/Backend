import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database';
import { AuthGuard, AuthModule } from './auth';
import { UsersModule } from './users';
import { FilmsModule } from './films';
import { STATIC_DIR, STATIC_DIR_PATH } from './const';
import { PresetsModule } from './presets';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env', '.env.local'],
		}),
		DatabaseModule.forRoot({
			isGlobal: true,
		}),
		ServeStaticModule.forRoot({
			rootPath: STATIC_DIR_PATH,
			serveRoot: path.join('/', STATIC_DIR),
			serveStaticOptions: {
				index: false,
			},
		}),
		AuthModule,
		UsersModule,
		FilmsModule,
		PresetsModule
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		}
	],
})
export class AppModule {}
