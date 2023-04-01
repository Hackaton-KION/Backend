import { CreatePresetDto, UpdatePresetDto } from '../dto';

export interface GetAllByUserIdParams {
	readonly userId: number;
}

export interface GetOneParams {
	readonly id: number;
}

export interface CreateParams extends CreatePresetDto {
	readonly userId?: number | null;
}

export interface UpdateParams extends UpdatePresetDto {
	readonly id: number;
}

export interface RemoveParams {
	readonly id: number;
}
