import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { isMimeType, storage } from '@/const';
import { FilmsService } from './services';
import { FilmsController } from './controllers';
import { FilmRepository } from './repositories';

@Module({
	imports: [
		MulterModule.register({
			storage,
			fileFilter(_, file: globalThis.Express.Multer.File, callback) {
				callback(null, isMimeType(file, 'video') || isMimeType(file, 'image'));
			},
		})
	],
	controllers: [FilmsController],
	providers: [FilmsService, FilmRepository],
})
export class FilmsModule {}
