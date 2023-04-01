import { DatabaseService } from '@/database';
import { Preset } from '../dto';
import {
	CreateParams,
	GetAllByUserIdParams,
	GetOneParams,
	RemoveParams,
	UpdateParams
} from './types';

export class PresetRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getAllByUserId(params: GetAllByUserIdParams): Promise<Preset[]> {
		return this.databaseService.preset.findMany({
			where: {
				userId: {
					in: [params.userId, null],
				},
			},
		});
	}

	async getOne(params: GetOneParams): Promise<Preset | null> {
		return this.databaseService.preset.findUnique({
			where: {
				id: params.id,
			},
		});
	}

	async create(params: CreateParams): Promise<Preset> {
		return this.databaseService.preset.create({
			data: params,
		});
	}

	async update(params: UpdateParams): Promise<Preset> {
		const { id, ...data } = params;

		return this.databaseService.preset.update({
			data,
			where: {
				id,
			},
		});
	}

	async remove(params: RemoveParams): Promise<unknown> {
		return this.databaseService.preset.delete({
			where: {
				id: params.id,
			},
		});
	}
}
