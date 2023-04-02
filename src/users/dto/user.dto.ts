import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class UserDto implements UserModel {
	@ApiProperty({
		type: Number,
		description: 'Id пользователя',
		example: 1,
	})
	@IsNumber()
	declare id: number;

	@ApiProperty({
		type: String,
		description: 'Имя пользователя, которое будет отображаться',
		example: 'login',
	})
	@IsString()
	declare login: string;

	@ApiProperty({
		type: String,
		description: 'Пароль пользователя',
		example: 'Password',
	})
	@ApiHideProperty()
	@IsString()
	declare password: string;
}
