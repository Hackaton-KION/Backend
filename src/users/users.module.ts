import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/auth';

import { UsersService } from './services';
import { UserRepository } from './repositories';

@Module({
	imports: [forwardRef(() => AuthModule)],
	providers: [UsersService, UserRepository],
	exports: [UsersService, UserRepository],
})
export class UsersModule {}
