import { Injectable } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { DatabaseService } from '@/database';
import { SecurityUserDto } from '../../dto';
import { SECURITY_USER_SELECT } from './config';
import { CreateData, GetOneByLoginParams, GetOneParams } from './types';

@Injectable()
export class UserRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async getOne(params: GetOneParams): Promise<SecurityUserDto | null> {
		return this.databaseService.user.findFirst({
			where: params,
			select: SECURITY_USER_SELECT,
		});
	}

	async getOneByLogin(params: GetOneByLoginParams): Promise<UserModel | null> {
		return this.databaseService.user.findFirst({
			where: params,
		});
	}

	async create(params: CreateData): Promise<SecurityUserDto> {
		return this.databaseService.user.create({
			data: params,
			select: SECURITY_USER_SELECT,
		});
	}
}
