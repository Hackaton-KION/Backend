import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database';
import { FilmDto } from '../dto';
import { CreateParams, GetOneParams } from './types';

@Injectable()
export class FilmRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getAll(): Promise<FilmDto[]> {
		return this.databaseService.film.findMany();
	}

	async getOne(params: GetOneParams): Promise<FilmDto | null> {
		return this.databaseService.film.findUnique({
			where: params,
		});
	}

	async create(params: CreateParams): Promise<FilmDto> {
		return this.databaseService.film.create({
			data: params,
		});
	}
}
