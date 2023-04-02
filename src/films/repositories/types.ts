import { CreateFilmDto } from '../dto';

export interface GetOneParams {
	readonly id: number;
}

export interface CreateParams extends CreateFilmDto {
	readonly video: string;
	readonly manifest: string;
	readonly preview: string;
}
