import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	ParseIntPipe,
	UseInterceptors,
	UploadedFiles
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilmsService } from '../services/films.service';
import { CreateFilmDto } from '../dto/create-film.dto';

@Controller('films')
export class FilmsController {
	constructor(private readonly filmsService: FilmsService) {}

	@Get()
	getAll() {
		return this.filmsService.getAll();
	}

	@Get()
	getRandom() {
		return this.filmsService.getAll();
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number) {
		return this.filmsService.getOne({ id, });
	}

	@Post('/add')
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'video', maxCount: 1, },
			{ name: 'preview', maxCount: 1, }
		])
	)
	create(
		@Body() dto: CreateFilmDto,
		@UploadedFiles()
			files: {
			video?: globalThis.Express.Multer.File[];
			preview?: globalThis.Express.Multer.File[];
		}
	) {
		const { preview, video, } = files;

		return this.filmsService.create({
			...dto,
			video: video.at(0),
			preview: preview.at(0),
		});
	}
}
