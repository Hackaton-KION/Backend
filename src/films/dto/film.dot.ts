import { Film as FilmModel } from '@prisma/client';

export class FilmDto implements FilmModel {
	declare id: number;

	declare description: string;

	declare video: string;

	declare title: string;

	declare releaseDate: Date;

	declare preview: string;

	declare manifest: string;
}
