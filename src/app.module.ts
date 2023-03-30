import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DatabaseModule } from './database';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { FilmsModule } from './films';
import { STATIC_DIR } from './const';

console.log(path.join(__dirname, '..', STATIC_DIR));

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
			rootPath: path.join(__dirname, '..', STATIC_DIR),
			serveStaticOptions: {
				index: STATIC_DIR,
			},
		}),
		AuthModule,
		UsersModule,
		FilmsModule
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
