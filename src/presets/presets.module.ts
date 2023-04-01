import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth';
import { PresetsService } from './services';
import { PresetsController } from './controllers';
import { PresetRepository } from './repositories';

@Module({
	imports: [AuthModule],
	controllers: [PresetsController],
	providers: [PresetsService, PresetRepository],
})
export class PresetsModule {}
