import { CreateFilmDto } from '../dto';

export interface GetOneParams {
	readonly id: number;
}

export interface CreateParams extends CreateFilmDto {
	readonly video: globalThis.Express.Multer.File;
	readonly preview: globalThis.Express.Multer.File;
}
