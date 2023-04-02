import { CreateUserDto } from '../../dto';

export interface GetOneParams {
	readonly id: number;
}

export interface CreateParams extends CreateUserDto {}

export interface GetInsecureParams {
	readonly login: string;
}
