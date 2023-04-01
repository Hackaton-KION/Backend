import { Injectable, NotFoundException } from '@nestjs/common';
import { PresetRepository } from '../repositories';
import {
	CreateParams,
	GetAllByUserIdParams,
	GetOneParams,
	RemoveParams,
	UpdateParams
} from './types';

@Injectable()
export class PresetsService {
	constructor(private readonly presetRepository: PresetRepository) {}

	async getAllByUser(params: GetAllByUserIdParams) {
		return this.presetRepository.getAllByUserId(params);
	}

	async getOne(params: GetOneParams) {
		const preset = await this.presetRepository.getOne(params);
		if (!preset) {
			throw new NotFoundException();
		}

		return preset;
	}

	async create(params: CreateParams) {
		return this.presetRepository.create(params);
	}

	async update(params: UpdateParams) {
		return this.presetRepository.update(params);
	}

	async remove(params: RemoveParams) {
		return this.presetRepository.remove(params);
	}
}
