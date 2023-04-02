import { CreateUserDto } from '../../dto';

export interface GetOneParams {
	readonly id: number;
}

export interface GetOneByLoginParams {
	readonly login: string;
}

export interface CreateData extends CreateUserDto {}
