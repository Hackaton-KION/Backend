import { PickType } from '@nestjs/swagger';
import { FilmDto } from './film.dot';

export class CreateFilmDto extends PickType(FilmDto, [
	'title',
	'description',
	'realeseDate'
]) {}
